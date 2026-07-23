"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  FileText,
  Kanban as KanbanIcon,
  Lock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Target,
  Timer,
  Trash2,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { downloadCSV } from "@/lib/exportUtils";

type TaskStatus = "backlog" | "in_progress" | "review" | "done";
type TaskPriority = "low" | "normal" | "high" | "urgent";
type FocusScreen = "board" | "select" | "workspace" | "success";

interface TaskRemark {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: string;
}

interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt?: any;
  startedAt?: any;
  approvedAt?: any;
  approvedBy?: string | null;
  description?: string;
  workNotes?: string;
  timeSpent?: string;
  attachments?: string[];
  checklist?: TaskChecklistItem[];
  submittedAt?: any;
  reviewFeedback?: string;
  focusSeconds?: number;
  sortOrder?: number;
  blocked?: boolean;
  remarks?: TaskRemark[];
}

interface FocusSession {
  taskId: string;
  originalStatus: TaskStatus;
  startedAt: number;
  elapsedSeconds: number;
  durationMinutes: number;
  notes: string;
  checklist: TaskChecklistItem[];
  pauses: number;
  paused: boolean;
}

interface FocusSummary {
  title: string;
  elapsedSeconds: number;
  pauses: number;
  startedAt: number;
  completedAt: number;
}

interface ToastMessage {
  text: string;
  tone: "success" | "error";
}

const COLUMNS: { id: TaskStatus; title: string; dot: string; note: string }[] = [
  { id: "backlog", title: "Backlog", dot: "bg-slate-400", note: "Ready to begin" },
  { id: "in_progress", title: "In Progress", dot: "bg-sky-400", note: "Work in motion" },
  { id: "review", title: "In Review", dot: "bg-amber-400", note: "Waiting for approval" },
  { id: "done", title: "Done", dot: "bg-emerald-400", note: "Approved work" },
];

const STATUS_VALUES: Record<TaskStatus, string[]> = {
  backlog: ["backlog"],
  in_progress: ["in_progress", "in-progress"],
  review: ["review", "in-review"],
  done: ["done", "completed"],
};

const PRIORITY_META: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  low: {
    label: "Low",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  normal: {
    label: "Medium",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    className: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    dot: "bg-orange-400",
  },
  urgent: {
    label: "Urgent",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
};

const ADMIN_ROLES = new Set(["founder", "system_admin", "c_suite", "manager", "admin"]);

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isToday(value?: string | null) {
  const date = toDate(value);
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isOverdue(value?: string | null) {
  const date = toDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function formatDate(value?: any) {
  const date = toDate(value);
  if (!date) return "No deadline";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value?: any) {
  const date = toDate(value);
  if (!date) return "Not submitted";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const minutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? hours + "h " + remainingMinutes + "m" : remainingMinutes + "m";
}

function formatClock(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createdAtMillis(value: any) {
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  return toDate(value)?.getTime() ?? 0;
}

function taskSortValue(task: Task) {
  return typeof task.sortOrder === "number" ? task.sortOrder : -createdAtMillis(task.createdAt);
}

function defaultChecklist(task: Task): TaskChecklistItem[] {
  if (task.checklist?.length) return task.checklist;
  return [
    { id: task.id + "-plan", text: "Review the task requirements", completed: false },
    { id: task.id + "-work", text: "Complete the implementation", completed: false },
    { id: task.id + "-review", text: "Check the final result", completed: false },
  ];
}

export default function TaskBoard() {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>({
    backlog: [],
    in_progress: [],
    review: [],
    done: [],
  });
  const [employeesByDept, setEmployeesByDept] = useState<Record<string, any[]>>({});
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [isFocusSetupOpen, setIsFocusSetupOpen] = useState(false);
  const [isExitFocusOpen, setIsExitFocusOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [recheckTaskId, setRecheckTaskId] = useState<string | null>(null);
  const [newRemark, setNewRemark] = useState("");
  const [taskNotesDraft, setTaskNotesDraft] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [recheckFeedback, setRecheckFeedback] = useState("");
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus>("backlog");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "normal" as TaskPriority,
    dueDate: "",
    assignedTo: "",
  });
  const [focusScreen, setFocusScreen] = useState<FocusScreen>("board");
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<string | null>(null);
  const [focusDuration, setFocusDuration] = useState(0);
  const [focusNotes, setFocusNotes] = useState("");
  const [focusBusy, setFocusBusy] = useState(true);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [focusChecklistInput, setFocusChecklistInput] = useState("");
  const [focusSummary, setFocusSummary] = useState<FocusSummary | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = ADMIN_ROLES.has(String(role));
  const canViewTeam = isAdmin;
  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks]);
  const selectedTask = useMemo(
    () => allTasks.find((task) => task.id === selectedTaskId) ?? null,
    [allTasks, selectedTaskId]
  );
  const recheckTask = useMemo(
    () => allTasks.find((task) => task.id === recheckTaskId) ?? null,
    [allTasks, recheckTaskId]
  );
  const focusTask = useMemo(
    () => allTasks.find((task) => task.id === focusSession?.taskId) ?? null,
    [allTasks, focusSession?.taskId]
  );
  const selectedFocusTask = useMemo(
    () => allTasks.find((task) => task.id === selectedFocusTaskId) ?? null,
    [allTasks, selectedFocusTaskId]
  );

  const showToast = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ text, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (role === "intern" || role === "employee") setMyTasksOnly(true);
  }, [role]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employees"));
        const employees = snapshot.docs.map((employee) => ({ id: employee.id, ...employee.data() }));
        setEmployeesList(employees);
        const grouped = employees.reduce((result, employee: any) => {
          const departments = employee.departments || (employee.department ? [employee.department] : ["Unassigned"]);
          departments.forEach((department: string) => {
            if (!result[department]) result[department] = [];
            if (!result[department].some((item: any) => item.id === employee.id)) result[department].push(employee);
          });
          return result;
        }, {} as Record<string, any[]>);
        setEmployeesByDept(grouped);
      } catch (error) {
        console.error("Could not load employees:", error);
        showToast("Employee list could not be loaded.", "error");
      }
    };

    fetchEmployees();
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const received = new Set<TaskStatus>();
    const unsubscribes = COLUMNS.map((column) => {
      const taskQuery = myTasksOnly
        ? query(
            collection(db, "tasks"),
            where("status", "in", STATUS_VALUES[column.id]),
            where("assignedTo", "==", user.uid)
          )
        : query(collection(db, "tasks"), where("status", "in", STATUS_VALUES[column.id]));

      return onSnapshot(
        taskQuery,
        (snapshot) => {
          const columnTasks = snapshot.docs
            .map((taskDocument) => ({ id: taskDocument.id, ...taskDocument.data(), status: column.id }) as Task)
            .sort((first, second) => taskSortValue(first) - taskSortValue(second));

          setTasks((current) => ({ ...current, [column.id]: columnTasks }));
          received.add(column.id);
          if (received.size === COLUMNS.length) setLoading(false);
        },
        (error) => {
          console.error("Task listener failed:", error);
          received.add(column.id);
          if (received.size === COLUMNS.length) setLoading(false);
          showToast("Tasks could not be refreshed. Please check your access.", "error");
        }
      );
    });

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [user, myTasksOnly, showToast]);

  useEffect(() => {
    if (focusScreen !== "workspace" || !focusSession || focusSession.paused) return;
    const timer = window.setInterval(() => {
      setFocusSession((current) => {
        if (!current || current.paused) return current;
        const elapsedSeconds = current.elapsedSeconds + 1;
        if (current.durationMinutes && elapsedSeconds >= current.durationMinutes * 60) {
          return { ...current, elapsedSeconds, paused: true };
        }
        return { ...current, elapsedSeconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [focusScreen, focusSession?.taskId, focusSession?.paused, focusSession?.durationMinutes]);

  const getEmployeeName = useCallback((employeeId?: string) => {
    if (!employeeId) return "Unassigned";
    if (employeeId === user?.uid) return user?.fullName || user?.displayName || "You";
    return employeesList.find((employee) => employee.id === employeeId)?.fullName || "Unassigned";
  }, [employeesList, user]);

  const openTaskDetails = (task: Task) => {
    setSelectedTaskId(task.id);
    setTaskNotesDraft(task.workNotes || "");
    setAttachmentName("");
    setNewRemark("");
    setIsDetailsOpen(true);
  };

  const handleAddTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !newTask.title.trim()) return;
    if (!isAdmin) {
      showToast("Only administrators can create tasks.", "error");
      return;
    }

    const assigneeId = newTask.assignedTo || user.uid;
    const assignee = employeesList.find((employee) => employee.id === assigneeId);
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        projectId: "general",
        projectName: "General",
        assignedTo: assigneeId,
        status: addingToStatus,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        workNotes: "",
        attachments: [],
        checklist: [],
        reviewFeedback: null,
        sortOrder: -Date.now(),
        createdAt: serverTimestamp(),
        blocked: false,
      });

      if (assigneeId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          userId: assigneeId,
          title: "New task assigned",
          message: "You have been assigned: " + newTask.title.trim(),
          senderName: user.fullName || user.displayName || "Task Manager",
          receiverName: assignee?.fullName || "Team member",
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setNewTask({ title: "", description: "", priority: "normal", dueDate: "", assignedTo: "" });
      setIsAddOpen(false);
      showToast("Task added to " + COLUMNS.find((column) => column.id === addingToStatus)?.title + ".");
    } catch (error) {
      console.error("Could not add task:", error);
      showToast("Task could not be created.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTask = async (taskId: string, changes: Record<string, unknown>, successMessage?: string) => {
    setIsActionSubmitting(true);
    try {
      await updateDoc(doc(db, "tasks", taskId), changes);
      if (successMessage) showToast(successMessage);
      return true;
    } catch (error) {
      console.error("Could not update task:", error);
      showToast("Task update failed. Please try again.", "error");
      return false;
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleStartTask = async (task: Task) => {
    if (task.assignedTo !== user?.uid) {
      showToast("Only the assigned employee can start this task.", "error");
      return;
    }
    const updated = await updateTask(
      task.id,
      { status: "in_progress", startedAt: serverTimestamp() },
      "Task moved to In Progress."
    );
    if (updated) setIsDetailsOpen(false);
  };

  const handleSubmitForReview = async (task: Task) => {
    if (task.assignedTo !== user?.uid) {
      showToast("Only the assigned employee can submit this task.", "error");
      return;
    }
    const updated = await updateTask(
      task.id,
      {
        status: "review",
        workNotes: taskNotesDraft.trim(),
        submittedAt: serverTimestamp(),
        reviewFeedback: null,
      },
      "Task submitted for admin review."
    );
    if (updated) setIsDetailsOpen(false);
  };

  const handleSaveNotes = async (task: Task) => {
    if (task.assignedTo !== user?.uid) {
      showToast("Only the assigned employee can edit work notes.", "error");
      return;
    }
    await updateTask(task.id, { workNotes: taskNotesDraft.trim() }, "Work notes saved.");
  };

  const handleAddAttachment = async (task: Task) => {
    if (task.assignedTo !== user?.uid) {
      showToast("Only the assigned employee can add attachments.", "error");
      return;
    }
    const filename = attachmentName.trim();
    if (!filename) return;
    const updated = await updateTask(
      task.id,
      { attachments: [...(task.attachments || []), filename] },
      "Attachment added to the task."
    );
    if (updated) setAttachmentName("");
  };

  const handleApprove = async (task: Task) => {
    if (!isAdmin) {
      showToast("Only administrators can approve tasks.", "error");
      return;
    }
    const updated = await updateTask(
      task.id,
      {
        status: "completed",
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid || null,
        reviewFeedback: null,
      },
      "Task approved and moved to Done."
    );
    if (updated) {
      setIsDetailsOpen(false);
      setIsRecheckOpen(false);
    }
  };

  const openRecheck = (task: Task) => {
    setRecheckTaskId(task.id);
    setRecheckFeedback("");
    setIsRecheckOpen(true);
  };

  const handleRecheck = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recheckTask || !recheckFeedback.trim()) return;
    if (!isAdmin) {
      showToast("Only administrators can request a recheck.", "error");
      return;
    }
    const feedback = recheckFeedback.trim();
    const remarks = [
      ...(recheckTask.remarks || []),
      {
        id: Math.random().toString(36).slice(2, 10),
        text: "Recheck requested: " + feedback,
        authorName: user?.fullName || user?.displayName || "Administrator",
        authorId: user?.uid || "system",
        createdAt: new Date().toISOString(),
      },
    ];
    const updated = await updateTask(
      recheckTask.id,
      {
        status: "in_progress",
        reviewFeedback: feedback,
        submittedAt: null,
        remarks,
      },
      "Task returned for recheck."
    );
    if (updated) {
      setIsRecheckOpen(false);
      setIsDetailsOpen(false);
      setRecheckFeedback("");
    }
  };

  const handleAddRemark = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTask || !newRemark.trim() || !user) return;
    if (selectedTask.status === "review" && !isAdmin) {
      showToast("Tasks under review are read-only until an administrator responds.", "error");
      return;
    }
    const updatedRemarks = [
      ...(selectedTask.remarks || []),
      {
        id: Math.random().toString(36).slice(2, 10),
        text: newRemark.trim(),
        authorName: user.fullName || user.displayName || "Team member",
        authorId: user.uid,
        createdAt: new Date().toISOString(),
      },
    ];
    const updated = await updateTask(selectedTask.id, { remarks: updatedRemarks }, "Progress update added.");
    if (updated) setNewRemark("");
  };

  const handleDeleteTask = async (task: Task) => {
    if (!isAdmin) {
      showToast("Only administrators can delete tasks.", "error");
      return;
    }
    if (!window.confirm("Delete this task permanently? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "tasks", task.id));
      if (selectedTaskId === task.id) setIsDetailsOpen(false);
      showToast("Task deleted.");
    } catch (error) {
      console.error("Could not delete task:", error);
      showToast("Task could not be deleted.", "error");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !result.destination) return;
    if (searchTerm.trim()) {
      showToast("Clear search before rearranging tasks.", "error");
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;
    if (destinationStatus === "review" || destinationStatus === "done") {
      showToast("Use Submit for Review or Approve to complete the workflow.", "error");
      return;
    }

    const draggedTask = tasks[sourceStatus][source.index];
    if (!draggedTask || draggedTask.status === "review" || draggedTask.status === "done") {
      showToast("This task must be moved with its review action.", "error");
      return;
    }

    const sourceTasks = [...tasks[sourceStatus]];
    const destinationTasks = sourceStatus === destinationStatus ? sourceTasks : [...tasks[destinationStatus]];
    const [removedTask] = sourceTasks.splice(source.index, 1);
    const movedTask = { ...removedTask, status: destinationStatus };
    destinationTasks.splice(destination.index, 0, movedTask);

    const previousTasks = { ...tasks };

    setTasks((current) => ({
      ...current,
      [sourceStatus]: sourceTasks,
      [destinationStatus]: destinationTasks,
    }));

    try {
      const orderedColumns =
        sourceStatus === destinationStatus
          ? [{ status: destinationStatus, tasks: destinationTasks }]
          : [
              { status: sourceStatus, tasks: sourceTasks },
              { status: destinationStatus, tasks: destinationTasks },
            ];
      const batch = writeBatch(db);
      orderedColumns.forEach((column) => {
        column.tasks.forEach((task, index) => {
          const newSortOrder = index + 1;
          const statusChanged = task.status !== column.status;
          const orderChanged = task.sortOrder !== newSortOrder;

          if (statusChanged || orderChanged) {
            const updates: Record<string, any> = {
              status: column.status,
              sortOrder: newSortOrder,
            };
            if (column.status === "in_progress" && task.id === draggedTask.id && !task.startedAt) {
              updates.startedAt = serverTimestamp();
            }
            batch.update(doc(db, "tasks", task.id), updates);
          }
        });
      });
      await batch.commit();
      showToast("Task moved to " + COLUMNS.find((column) => column.id === destinationStatus)?.title + ".");
    } catch (error) {
      console.error("Could not move task:", error);
      setTasks(previousTasks);
      showToast("Task could not be moved. It will refresh shortly.", "error");
    }
  };

  const handleExportCSV = () => {
    const formatted = allTasks.map((task) => ({
      ...task,
      assigneeName: getEmployeeName(task.assignedTo),
      statusName: COLUMNS.find((column) => column.id === task.status)?.title || task.status,
      feedback: task.reviewFeedback || "",
    }));
    downloadCSV(
      formatted,
      ["Task Title", "Description", "Project", "Assignee", "Priority", "Status", "Due Date", "Feedback"],
      ["title", "description", "projectName", "assigneeName", "priority", "statusName", "dueDate", "feedback"],
      "task-admin-export.csv"
    );
    showToast("Task CSV exported.");
  };

  const visibleTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tasks;
    return COLUMNS.reduce((result, column) => {
      result[column.id] = tasks[column.id].filter((task) => {
        const assignee = getEmployeeName(task.assignedTo).toLowerCase();
        return [task.title, task.description, task.projectName, assignee, task.priority]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      });
      return result;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks, searchTerm, getEmployeeName]);

  const focusCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...tasks.backlog, ...tasks.in_progress].filter((task) => {
      if (task.assignedTo !== user?.uid) return false;
      if (!term) return true;
      return [task.title, task.description, task.projectName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [tasks, user?.uid, searchTerm]);

  const startFocus = async () => {
    if (!selectedFocusTask) return;
    setIsFocusSetupOpen(false);
    const updated = await updateTask(
      selectedFocusTask.id,
      selectedFocusTask.status === "backlog"
        ? { status: "in_progress", focusStartedAt: serverTimestamp(), focusBusy }
        : { focusStartedAt: serverTimestamp(), focusBusy },
      "Focus session started."
    );
    if (!updated) return;

    setFocusSession({
      taskId: selectedFocusTask.id,
      originalStatus: selectedFocusTask.status,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      durationMinutes: focusDuration,
      notes: focusNotes.trim(),
      checklist: defaultChecklist(selectedFocusTask),
      pauses: 0,
      paused: false,
    });
    setFocusScreen("workspace");
  };

  const pauseFocus = () => {
    setFocusSession((current) => (current ? { ...current, paused: true, pauses: current.pauses + 1 } : current));
    setFocusScreen("board");
    showToast("Focus session paused. Resume when you are ready.");
  };

  const resumeFocus = () => {
    setFocusSession((current) => (current ? { ...current, paused: false } : current));
    setFocusScreen("workspace");
  };

  const toggleChecklistItem = (itemId: string) => {
    setFocusSession((current) =>
      current
        ? {
            ...current,
            checklist: current.checklist.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          }
        : current
    );
  };

  const addChecklistItem = () => {
    const value = focusChecklistInput.trim();
    if (!value) return;
    setFocusSession((current) =>
      current
        ? {
            ...current,
            checklist: [...current.checklist, { id: Math.random().toString(36).slice(2, 10), text: value, completed: false }],
          }
        : current
    );
    setFocusChecklistInput("");
  };

  const completeFocus = async () => {
    if (!focusSession || !focusTask) return;
    const completedAt = Date.now();
    const updated = await updateTask(
      focusTask.id,
      {
        status: "review",
        workNotes: focusSession.notes,
        checklist: focusSession.checklist,
        focusSeconds: (focusTask.focusSeconds || 0) + focusSession.elapsedSeconds,
        timeSpent: formatDuration((focusTask.focusSeconds || 0) + focusSession.elapsedSeconds),
        submittedAt: serverTimestamp(),
        reviewFeedback: null,
      },
      "Task submitted for review."
    );
    if (!updated) return;

    setFocusSummary({
      title: focusTask.title,
      elapsedSeconds: focusSession.elapsedSeconds,
      pauses: focusSession.pauses,
      startedAt: focusSession.startedAt,
      completedAt,
    });
    setFocusSession(null);
    setFocusScreen("success");
  };

  const exitFocus = async () => {
    if (!focusSession) return;
    const updated = await updateTask(
      focusSession.taskId,
      { status: focusSession.originalStatus, focusBusy: false },
      "Focus session discarded and task restored."
    );
    if (!updated) return;
    setFocusSession(null);
    setIsExitFocusOpen(false);
    setFocusScreen("board");
  };

  const toastElement = (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className={cn(
            "fixed bottom-6 right-6 z-[500] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl",
            toast.tone === "success"
              ? "border-emerald-400/30 bg-[#172215] text-emerald-100"
              : "border-rose-400/30 bg-[#281415] text-rose-100"
          )}
        >
          {toast.tone === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-rose-300" />}
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (focusScreen === "workspace" && focusSession && focusTask) {
    const completedCount = focusSession.checklist.filter((item) => item.completed).length;
    const progress = focusSession.checklist.length
      ? Math.round((completedCount / focusSession.checklist.length) * 100)
      : 0;
    const remaining =
      focusSession.durationMinutes > 0
        ? Math.max(0, focusSession.durationMinutes * 60 - focusSession.elapsedSeconds)
        : null;

    return (
      <div className="fixed inset-0 z-[300] overflow-y-auto bg-[#0b0f0b] px-4 py-8 text-[#edf2e8] sm:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-6">
          <div className="rounded-full border border-[#94ad55]/30 bg-[#94ad55]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#b6d66b]">
            Focus mode
          </div>
          <div className="text-center">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#829078]">Current task</p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{focusTask.title}</h1>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide", PRIORITY_META[focusTask.priority].className)}>
                Priority · {PRIORITY_META[focusTask.priority].label}
              </span>
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-300">
                Status · In Progress
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="font-mono text-5xl font-light tracking-tight text-[#eef3e8] sm:text-6xl">{formatClock(focusSession.elapsedSeconds)}</div>
            <p className="mt-2 text-xs font-medium text-[#92a08a]">
              {remaining === null ? "No time limit" : formatClock(remaining) + " remaining"}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-[#2b3527] bg-[#11170f] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">
              <span>Session progress</span>
              <span className="text-[#b6d66b]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#222b1f]">
              <motion.div
                animate={{ width: progress + "%" }}
                className="h-full rounded-full bg-[#a8c765]"
              />
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#2b3527] bg-[#11170f] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <div className="mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#b6d66b]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide">Checklist</h2>
            </div>
            <div className="space-y-2">
              {focusSession.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-[#1a2217]"
                >
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    item.completed
                      ? "border-[#a8c765] bg-[#a8c765] text-[#0b0f0b]"
                      : "border-[#46533f] bg-transparent text-transparent"
                  )}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span className={cn(item.completed && "text-[#83907b] line-through")}>{item.text}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={focusChecklistInput}
                onChange={(event) => setFocusChecklistInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Add a checklist item..."
                className="border-[#364130] bg-[#0d120b] text-[#edf2e8] placeholder:text-[#6e7967]"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="rounded-lg border border-[#3b4934] px-3 text-xs font-bold text-[#c5d1bb] transition hover:border-[#94ad55] hover:text-[#c5df86]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#2b3527] bg-[#11170f] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Quick notes</label>
            <textarea
              value={focusSession.notes}
              onChange={(event) => setFocusSession((current) => (current ? { ...current, notes: event.target.value } : current))}
              placeholder="Jot down notes while you work..."
              className="min-h-28 w-full resize-y rounded-xl border border-[#364130] bg-[#0d120b] px-3 py-3 text-sm text-[#edf2e8] placeholder:text-[#6e7967] outline-none transition focus:border-[#94ad55]"
            />
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {remaining === 0 ? (
              <div className="flex h-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-bold text-rose-300">
                Time limit reached
              </div>
            ) : (
              <button
                type="button"
                onClick={pauseFocus}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#3b4934] text-sm font-bold text-[#d5ddd0] transition hover:border-[#94ad55] hover:bg-[#182013]"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button
              type="button"
              onClick={completeFocus}
              disabled={isActionSubmitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#a8c765] text-sm font-extrabold text-[#0b0f0b] transition hover:bg-[#b8d779] disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Complete task
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsExitFocusOpen(true)}
            className="mb-4 text-xs font-bold text-rose-300 transition hover:text-rose-200"
          >
            Exit Focus Mode
          </button>
        </div>

        <Dialog open={isExitFocusOpen} onOpenChange={setIsExitFocusOpen}>
          <DialogContent className="border-[#394431] bg-[#11170f] text-[#edf2e8] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Exit Focus Mode?</DialogTitle>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-[#9da996]">
              This session's unsaved focus progress will be discarded and the task will return to its previous status.
            </p>
            <div className="rounded-xl border border-[#394431] bg-[#0d120b] px-4 py-3 text-sm">
              This session: <span className="font-bold text-[#c6df84]">{formatDuration(focusSession.elapsedSeconds)}</span>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsExitFocusOpen(false)}
                className="px-4 py-2 text-sm font-bold text-[#b8c2b2]"
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={exitFocus}
                disabled={isActionSubmitting}
                className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-extrabold text-[#1b090a] disabled:opacity-50"
              >
                Exit and discard
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {toastElement}
      </div>
    );
  }

  if (focusScreen === "success") {
    return (
      <div className="fixed inset-0 z-[300] flex overflow-y-auto bg-[#0b0f0b] px-4 py-8 text-[#edf2e8]">
        <div className="m-auto w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b6d66b]">Task submitted</p>
          <h1 className="mt-2 text-3xl font-extrabold">Great work!</h1>
          <p className="mt-2 text-sm text-[#9da996]">{focusSummary?.title}</p>
          <div className="mt-7 overflow-hidden rounded-2xl border border-[#2b3527] bg-[#11170f] text-left">
            {[
              ["Focus time", formatDuration(focusSummary?.elapsedSeconds || 0)],
              ["Breaks", String(focusSummary?.pauses || 0)],
              ["Started", focusSummary ? new Date(focusSummary.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"],
              ["Completed", focusSummary ? new Date(focusSummary.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"],
            ].map(([label, value], index) => (
              <div key={label} className={cn("flex items-center justify-between px-5 py-4 text-sm", index > 0 && "border-t border-[#2b3527]")}>
                <span className="text-[#91a08a]">{label}</span>
                <span className="font-bold text-[#edf2e8]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setFocusScreen("board")}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#a8c765] text-sm font-extrabold text-[#0b0f0b] transition hover:bg-[#b8d779]"
            >
              Go to task dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setFocusSummary(null);
                setSelectedFocusTaskId(null);
                setFocusNotes("");
                setFocusScreen("select");
              }}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-[#3b4934] text-sm font-bold text-[#d5ddd0] transition hover:border-[#94ad55]"
            >
              Start another session
            </button>
          </div>
        </div>
        {toastElement}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-[#293224] bg-[#0b0f0b] text-[#edf2e8] shadow-[0_18px_70px_rgba(0,0,0,0.18)]">
      {focusScreen === "select" ? (
        <div className="mx-auto min-h-[calc(100vh-5rem)] max-w-3xl px-5 py-8 sm:px-8">
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedFocusTaskId(null);
              setFocusScreen("board");
            }}
            className="mb-7 text-xs font-bold uppercase tracking-wide text-[#aeb8a6] transition hover:text-[#c9df8a]"
          >
            ← Back to dashboard
          </button>
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-[#c5df86]">
              <Target className="h-5 w-5" />
              <span className="text-xs font-extrabold uppercase tracking-[0.16em]">Focus Mode</span>
            </div>
            <h1 className="text-2xl font-extrabold">Choose one task to work on.</h1>
            <p className="mt-2 text-sm text-[#9da996]">Keep distractions away and submit your work for review when you finish.</p>
          </div>
          <label className="mb-5 flex h-11 items-center gap-3 rounded-xl border border-[#34402f] bg-[#11170f] px-3 text-[#90a088] focus-within:border-[#94ad55]">
            <Search className="h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search my active tasks..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#edf2e8] outline-none placeholder:text-[#71806b]"
            />
          </label>
          <div className="space-y-3">
            {focusCandidates.map((task) => {
              const isSelected = task.id === selectedFocusTaskId;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedFocusTaskId(task.id)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
                    isSelected
                      ? "border-[#a8c765] bg-[#1a2514] shadow-[0_0_0_1px_rgba(168,199,101,0.12)]"
                      : "border-[#2b3527] bg-[#11170f] hover:border-[#526148] hover:bg-[#151d12]"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    isSelected ? "border-[#a8c765] bg-[#a8c765] text-[#0b0f0b]" : "border-[#53604b] text-transparent"
                  )}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-[#edf2e8]">{task.title}</span>
                    {task.description && <span className="mt-1 block text-xs leading-relaxed text-[#9da996]">{task.description}</span>}
                    <span className="mt-3 flex flex-wrap gap-2">
                      <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", PRIORITY_META[task.priority].className)}>
                        {PRIORITY_META[task.priority].label}
                      </span>
                      {task.dueDate && (
                        <span className="rounded-full border border-[#35402f] bg-[#171f14] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#b0bbaa]">
                          {isOverdue(task.dueDate) ? "Overdue" : "Due " + formatDate(task.dueDate)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
            {focusCandidates.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#3b4934] px-5 py-12 text-center">
                <CheckSquare className="mx-auto h-8 w-8 text-[#64705f]" />
                <p className="mt-3 text-sm font-bold text-[#aeb8a6]">No active tasks found</p>
                <p className="mt-1 text-xs text-[#71806b]">Start a backlog task or clear the search to continue.</p>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 mt-6 border-t border-[#293224] bg-[#0b0f0b]/95 py-5 backdrop-blur">
            <button
              type="button"
              disabled={!selectedFocusTaskId}
              onClick={() => setIsFocusSetupOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#a8c765] text-sm font-extrabold text-[#0b0f0b] transition hover:bg-[#b8d779] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Timer className="h-4 w-4" /> Start Focus Mode
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-5 border-b border-[#293224] px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a8c765]">
                {isAdmin ? "Task administration" : "My workspace"}
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"},
                {" "}{(user?.fullName || user?.displayName || "Team").split(" ")[0]}
              </h1>
              <p className="mt-1 text-xs text-[#92a08a]">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[#34402f] bg-[#11170f] px-3 text-[#829078] focus-within:border-[#94ad55] sm:w-72">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search tasks..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#edf2e8] outline-none placeholder:text-[#71806b]"
                />
              </label>
              <div className="flex items-center gap-3">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-[#aeb8a6] transition hover:border-[#34402f] hover:bg-[#11170f]" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 rounded-xl border border-[#4a5a40]">
                    <AvatarFallback className="rounded-xl bg-[#a8c765] text-xs font-extrabold text-[#0b0f0b]">
                      {getInitials(user?.fullName || user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-extrabold">{user?.fullName || user?.displayName || "System"}</p>
                    <p className="text-[11px] text-[#a8c765]">{isAdmin ? "System Admin" : "Team Member"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 lg:px-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold">
                  <KanbanIcon className="h-5 w-5 text-[#b6d66b]" /> Tasks
                </h2>
                <p className="mt-1 text-xs text-[#92a08a]">Manage work across active projects and approvals.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (focusSession?.paused) {
                      resumeFocus();
                      return;
                    }
                    setSearchTerm("");
                    setSelectedFocusTaskId(null);
                    setFocusScreen("select");
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#3b4934] px-4 text-xs font-bold text-[#d5ddd0] transition hover:border-[#94ad55] hover:bg-[#182013]"
                >
                  <Target className="h-4 w-4 text-[#b6d66b]" />
                  {focusSession?.paused ? (focusSession.durationMinutes > 0 && focusSession.elapsedSeconds >= focusSession.durationMinutes * 60 ? "View Expired Focus" : "Resume Focus") : "Focus Mode"}
                </button>
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#34402f] bg-[#11170f] px-3 text-xs font-bold">
                  <span className={cn(!myTasksOnly ? "text-[#edf2e8]" : "text-[#76816f]")}>Team</span>
                  <button
                    type="button"
                    onClick={() => canViewTeam && setMyTasksOnly((current) => !current)}
                    disabled={!canViewTeam}
                    aria-label="Toggle team or my tasks"
                    className={cn(
                      "relative h-5 w-9 rounded-full transition",
                      myTasksOnly ? "bg-[#829c4d]" : "bg-[#2b3527]",
                      !canViewTeam && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-[#edf2e8] shadow transition",
                      myTasksOnly ? "left-[18px]" : "left-0.5"
                    )} />
                  </button>
                  <span className={cn(myTasksOnly ? "text-[#edf2e8]" : "text-[#76816f]")}>Mine</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#3b4934] px-4 text-xs font-bold text-[#d5ddd0] transition hover:border-[#94ad55] hover:bg-[#182013]"
                >
                  <Download className="h-4 w-4 text-[#b6d66b]" /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingToStatus("backlog");
                    setIsAddOpen(true);
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#a8c765] px-4 text-xs font-extrabold text-[#0b0f0b] transition hover:bg-[#b8d779]"
                >
                  <Plus className="h-4 w-4 stroke-[3]" /> Add Task
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <Clock className="h-7 w-7 animate-spin text-[#b6d66b]" />
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {COLUMNS.map((column) => {
                    const columnTasks = visibleTasks[column.id];
                    return (
                      <section key={column.id} className="flex min-h-[440px] flex-col rounded-2xl border border-[#2b3527] bg-[#10150f] p-3">
                        <div className="flex items-start justify-between gap-3 px-1 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2 w-2 rounded-full", column.dot)} />
                              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#dce5d6]">{column.title}</h3>
                            </div>
                            <p className="mt-1 text-[11px] text-[#74806d]">{column.note}</p>
                          </div>
                          <Badge className="min-w-6 justify-center rounded-full border border-[#536146]/40 bg-[#1e2a17] px-2 py-0.5 text-[11px] font-extrabold text-[#b6d66b]">
                            {columnTasks.length}
                          </Badge>
                        </div>

                        <Droppable droppableId={column.id} isDropDisabled={column.id === "review" || column.id === "done"}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                "flex min-h-28 flex-1 flex-col gap-3 rounded-xl transition",
                                snapshot.isDraggingOver && "bg-[#243018]/80 ring-1 ring-[#94ad55]/30"
                              )}
                            >
                              {columnTasks.map((task, index) => {
                                const priority = PRIORITY_META[task.priority];
                                const taskIsFocused = focusSession?.taskId === task.id && focusSession.paused;
                                const ownsTask = task.assignedTo === user?.uid;
                                const canDelete = isAdmin || ownsTask;
                                return (
                                  <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={index}
                                    isDragDisabled={Boolean(searchTerm.trim()) || task.status === "review" || task.status === "done"}
                                  >
                                    {(dragProvided, dragSnapshot) => (
                                      <article
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        onClick={() => openTaskDetails(task)}
                                        className={cn(
                                          "group cursor-pointer rounded-xl border border-[#303b2b] bg-[#151b13] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-[#697c5b] hover:bg-[#182013]",
                                          dragSnapshot.isDragging && "rotate-1 border-[#a8c765] opacity-90 shadow-2xl",
                                          task.priority === "urgent" && "border-l-2 border-l-rose-400"
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", priority.className)}>
                                                {priority.label}
                                              </span>
                                              {task.blocked && <Lock className="h-3.5 w-3.5 text-rose-300" />}
                                            </div>
                                            <h4 className="text-sm font-extrabold leading-snug text-[#edf2e8]">{task.title}</h4>
                                          </div>
                                          {canDelete && (
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteTask(task);
                                              }}
                                              className="rounded-lg p-1 text-[#63705d] opacity-0 transition hover:bg-rose-400/10 hover:text-rose-300 group-hover:opacity-100 focus:opacity-100"
                                              aria-label="Delete task"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                        </div>
                                        {task.description && (
                                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#93a08b]">{task.description}</p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          <span className="inline-flex items-center gap-1 rounded-full border border-[#35402f] bg-[#11170f] px-2 py-1 text-[10px] font-semibold text-[#a9b4a2]">
                                            <UserRound className="h-3 w-3 text-[#b6d66b]" />
                                            {getEmployeeName(task.assignedTo)}
                                          </span>
                                          {task.dueDate && (
                                            <span className={cn(
                                              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold",
                                              isOverdue(task.dueDate)
                                                ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                                                : isToday(task.dueDate)
                                                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                                  : "border-[#35402f] bg-[#11170f] text-[#a9b4a2]"
                                            )}>
                                              <CalendarDays className="h-3 w-3" />
                                              {isOverdue(task.dueDate) ? "Overdue" : formatDate(task.dueDate)}
                                            </span>
                                          )}
                                        </div>
                                        {taskIsFocused && (
                                          <div className="mt-3 rounded-lg border border-sky-400/20 bg-sky-400/10 px-2.5 py-2 text-[11px] font-bold text-sky-300">
                                            Focus paused · {formatDuration(focusSession?.elapsedSeconds || 0)}
                                          </div>
                                        )}
                                        {task.status === "review" && (
                                          <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-2 text-[11px] font-bold text-amber-300">
                                            {isAdmin
                                              ? getEmployeeName(task.assignedTo) + " submitted " + formatDateTime(task.submittedAt)
                                              : "Waiting for admin approval"}
                                          </div>
                                        )}
                                        {task.reviewFeedback && task.status === "in_progress" && (
                                          <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-2.5 py-2 text-[11px] font-bold text-rose-200">
                                            Recheck requested
                                          </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between border-t border-[#2d3829] pt-3 text-[11px] font-semibold text-[#7e8c76]">
                                          <span className="flex items-center gap-1.5">
                                            <MessageSquare className="h-3.5 w-3.5 text-[#b6d66b]" /> {task.remarks?.length || 0}
                                          </span>
                                          <span className="flex items-center gap-1.5">
                                            <CheckSquare className="h-3.5 w-3.5 text-[#b6d66b]" />
                                            {task.status === "done" ? "Complete" : (task.checklist?.filter((item) => item.completed).length || 0) + "/" + (task.checklist?.length || 0)}
                                          </span>
                                        </div>
                                        {task.status === "review" && isAdmin && (
                                          <div className="mt-3 grid grid-cols-2 gap-2">
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleApprove(task);
                                              }}
                                              disabled={isActionSubmitting}
                                              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-400 text-[11px] font-extrabold text-[#0b120b] transition hover:bg-emerald-300 disabled:opacity-50"
                                            >
                                              <Check className="h-3.5 w-3.5 stroke-[3]" /> Approve
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                openRecheck(task);
                                              }}
                                              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-400/50 text-[11px] font-extrabold text-rose-300 transition hover:bg-rose-400/10"
                                            >
                                              Recheck
                                            </button>
                                          </div>
                                        )}
                                         {task.status === "backlog" && ownsTask && (
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleStartTask(task);
                                            }}
                                            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-sky-400 text-[11px] font-extrabold text-[#071119] transition hover:bg-sky-300"
                                          >
                                            <Play className="h-3.5 w-3.5 fill-current" /> Start task
                                          </button>
                                        )}
                                      </article>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                              {columnTasks.length === 0 && (
                                <div className="rounded-xl border border-dashed border-[#35402f] px-3 py-7 text-center text-xs text-[#71806b]">
                                  No tasks here yet.
                                </div>
                              )}
                              {column.id === "backlog" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingToStatus("backlog");
                                    setIsAddOpen(true);
                                  }}
                                  className="flex h-10 w-full items-center gap-2 rounded-xl border border-dashed border-[#3c4836] px-3 text-xs font-bold text-[#7f8c78] transition hover:border-[#94ad55] hover:bg-[#182013] hover:text-[#c5df86]"
                                >
                                  <Plus className="h-4 w-4" /> Add a task
                                </button>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </section>
                    );
                  })}
                </div>
              </DragDropContext>
            )}
          </main>
        </>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border-[#394431] bg-[#11170f] text-[#edf2e8] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <p className="text-sm text-[#9da996]">Create a task and add it to the backlog.</p>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="mt-3 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Task title</label>
              <Input
                required
                value={newTask.title}
                onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))}
                placeholder="What needs to be done?"
                className="border-[#394431] bg-[#0d120b] text-[#edf2e8] placeholder:text-[#6e7967]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Description</label>
              <textarea
                value={newTask.description}
                onChange={(event) => setNewTask((current) => ({ ...current, description: event.target.value }))}
                placeholder="Add a short description or acceptance criteria..."
                className="min-h-24 w-full resize-y rounded-lg border border-[#394431] bg-[#0d120b] px-3 py-2 text-sm text-[#edf2e8] placeholder:text-[#6e7967] outline-none focus:border-[#94ad55]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Assign to</label>
              <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask((current) => ({ ...current, assignedTo: value }))}>
                <SelectTrigger className="border-[#394431] bg-[#0d120b] text-[#edf2e8]">
                  <SelectValue placeholder="Assign to me" />
                </SelectTrigger>
                <SelectContent className="max-h-64 border-[#394431] bg-[#11170f] text-[#edf2e8]">
                  {user?.uid && <SelectItem value={user.uid}>Assign to me</SelectItem>}
                  {Object.entries(employeesByDept).map(([department, employees]) => {
                    const filteredEmployees = employees.filter((employee) => employee.id !== user?.uid);
                    if (filteredEmployees.length === 0) return null;
                    return (
                      <SelectGroup key={department}>
                        <SelectLabel className="text-[#b6d66b]">{department}</SelectLabel>
                        {filteredEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.fullName || employee.email || "Unnamed employee"}
                            {employee.jobTitle ? " · " + employee.jobTitle : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Priority</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask((current) => ({ ...current, priority: value as TaskPriority }))}>
                  <SelectTrigger className="border-[#394431] bg-[#0d120b] text-[#edf2e8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#394431] bg-[#11170f] text-[#edf2e8]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Due date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(event) => setNewTask((current) => ({ ...current, dueDate: event.target.value }))}
                  className="border-[#394431] bg-[#0d120b] text-[#edf2e8]"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-bold text-[#aeb8a6]" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#a8c765] px-4 py-2 text-sm font-extrabold text-[#0b0f0b] disabled:opacity-50">
                {isSubmitting ? "Creating..." : "Add task"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-[#394431] bg-[#11170f] text-[#edf2e8] sm:max-w-2xl">
          <DialogHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide", selectedTask ? PRIORITY_META[selectedTask.priority].className : "")}>
                {selectedTask ? PRIORITY_META[selectedTask.priority].label : "Task"}
              </span>
              <span className="rounded-full border border-[#3b4934] bg-[#171f14] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#b8c2b2]">
                {selectedTask ? COLUMNS.find((column) => column.id === selectedTask.status)?.title : ""}
              </span>
            </div>
            <DialogTitle className="pr-7 text-xl leading-snug">{selectedTask?.title || "Task details"}</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="mt-3 space-y-5">
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9da996]">Description</h3>
                <div className="rounded-xl border border-[#394431] bg-[#0d120b] px-4 py-3 text-sm leading-relaxed text-[#c8d1c2]">
                  {selectedTask.description || "No description has been added yet."}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#394431] bg-[#0d120b] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#75806e]">Assignee</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-bold">
                    <Avatar className="h-6 w-6 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-[#283520] text-[10px] text-[#c5df86]">{getInitials(getEmployeeName(selectedTask.assignedTo))}</AvatarFallback>
                    </Avatar>
                    {getEmployeeName(selectedTask.assignedTo)}
                  </div>
                </div>
                <div className="rounded-xl border border-[#394431] bg-[#0d120b] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#75806e]">Deadline</p>
                  <p className={cn("mt-2 flex items-center gap-2 text-sm font-bold", isOverdue(selectedTask.dueDate) ? "text-rose-300" : "text-[#dbe4d5]")}>
                    <CalendarDays className="h-4 w-4 text-[#b6d66b]" /> {formatDate(selectedTask.dueDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#394431] bg-[#0d120b] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#75806e]">Time spent</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#dbe4d5]">
                    <Clock className="h-4 w-4 text-[#b6d66b]" /> {selectedTask.timeSpent || formatDuration(selectedTask.focusSeconds || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#394431] bg-[#0d120b] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#75806e]">Submission</p>
                  <p className="mt-2 text-sm font-bold text-[#dbe4d5]">{formatDateTime(selectedTask.submittedAt)}</p>
                </div>
              </section>

              {selectedTask.reviewFeedback && (
                <section className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-rose-200">
                    <AlertTriangle className="h-4 w-4" /> Recheck requested
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-rose-100/85">{selectedTask.reviewFeedback}</p>
                </section>
              )}

              <section>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#9da996]">Attachments</h3>
                  {selectedTask.status === "in_progress" && selectedTask.assignedTo === user?.uid && (
                    <span className="text-[10px] text-[#75806e]">Add a filename or shared link</span>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedTask.attachments?.length ? (
                    selectedTask.attachments.map((attachment) => (
                      <div key={attachment} className="flex items-center gap-2 rounded-lg border border-[#394431] bg-[#0d120b] px-3 py-2 text-xs text-[#c8d1c2]">
                        <FileText className="h-3.5 w-3.5 text-[#b6d66b]" /> {attachment}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#394431] px-3 py-3 text-xs text-[#75806e]">No attachments added.</div>
                  )}
                </div>
                {selectedTask.status === "in_progress" && selectedTask.assignedTo === user?.uid && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={attachmentName}
                      onChange={(event) => setAttachmentName(event.target.value)}
                      placeholder="design-spec.pdf or shared link"
                      className="h-9 border-[#394431] bg-[#0d120b] text-xs text-[#edf2e8] placeholder:text-[#6e7967]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddAttachment(selectedTask)}
                      disabled={isActionSubmitting || !attachmentName.trim()}
                      className="rounded-lg border border-[#4b5b42] px-3 text-xs font-bold text-[#c5df86] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </section>

              {selectedTask.status === "in_progress" && selectedTask.assignedTo === user?.uid && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#9da996]">Work notes</h3>
                    <button type="button" onClick={() => handleSaveNotes(selectedTask)} disabled={isActionSubmitting} className="text-xs font-bold text-[#c5df86] disabled:opacity-50">
                      Save notes
                    </button>
                  </div>
                  <textarea
                    value={taskNotesDraft}
                    onChange={(event) => setTaskNotesDraft(event.target.value)}
                    placeholder="Summarize progress, implementation notes, or blockers..."
                    className="min-h-28 w-full resize-y rounded-xl border border-[#394431] bg-[#0d120b] px-3 py-3 text-sm text-[#edf2e8] placeholder:text-[#6e7967] outline-none focus:border-[#94ad55]"
                  />
                </section>
              )}

              {selectedTask.status === "review" && !isAdmin && (
                <section className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Waiting on an administrator's review. This task is read-only until a decision is made.
                </section>
              )}

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9da996]">
                  <MessageSquare className="h-3.5 w-3.5 text-[#b6d66b]" /> Progress log ({selectedTask.remarks?.length || 0})
                </h3>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {selectedTask.remarks?.length ? (
                    selectedTask.remarks.map((remark) => (
                      <div key={remark.id} className="rounded-xl border border-[#394431] bg-[#0d120b] p-3">
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wide">
                          <span className="text-[#c5df86]">{remark.authorName}</span>
                          <span className="text-[#75806e]">{formatDateTime(remark.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#c8d1c2]">{remark.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#394431] px-3 py-5 text-center text-xs text-[#75806e]">No progress updates yet.</div>
                  )}
                </div>
                <form onSubmit={handleAddRemark} className="mt-3 flex gap-2">
                  <Input
                    required
                    value={newRemark}
                    onChange={(event) => setNewRemark(event.target.value)}
                    placeholder="Write a progress update..."
                    className="h-9 border-[#394431] bg-[#0d120b] text-xs text-[#edf2e8] placeholder:text-[#6e7967]"
                  />
                  <button type="submit" disabled={isActionSubmitting || !newRemark.trim()} className="flex h-9 items-center gap-1 rounded-lg bg-[#283520] px-3 text-xs font-bold text-[#c5df86] disabled:opacity-50">
                    <Send className="h-3.5 w-3.5" /> Log
                  </button>
                </form>
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                 {selectedTask.status === "backlog" && selectedTask.assignedTo === user?.uid && (
                  <button type="button" onClick={() => handleStartTask(selectedTask)} disabled={isActionSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-400 text-sm font-extrabold text-[#071119] disabled:opacity-50">
                    <Play className="h-4 w-4 fill-current" /> Start task
                  </button>
                )}
                {selectedTask.status === "in_progress" && selectedTask.assignedTo === user?.uid && (
                  <button type="button" onClick={() => handleSubmitForReview(selectedTask)} disabled={isActionSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#a8c765] text-sm font-extrabold text-[#0b0f0b] disabled:opacity-50">
                    <Send className="h-4 w-4" /> Submit for review
                  </button>
                )}
                {selectedTask.status === "review" && isAdmin && (
                  <>
                    <button type="button" onClick={() => handleApprove(selectedTask)} disabled={isActionSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 text-sm font-extrabold text-[#0b120b] disabled:opacity-50">
                      <Check className="h-4 w-4 stroke-[3]" /> Approve
                    </button>
                    <button type="button" onClick={() => openRecheck(selectedTask)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/50 text-sm font-extrabold text-rose-300 transition hover:bg-rose-400/10">
                      Recheck
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRecheckOpen} onOpenChange={setIsRecheckOpen}>
        <DialogContent className="border-[#394431] bg-[#11170f] text-[#edf2e8] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send back for recheck</DialogTitle>
            <p className="text-sm text-[#9da996]">Explain exactly what needs to change before the task can be approved.</p>
          </DialogHeader>
          <form onSubmit={handleRecheck} className="mt-3 space-y-4">
            <textarea
              required
              value={recheckFeedback}
              onChange={(event) => setRecheckFeedback(event.target.value)}
              placeholder="For example: please include the mobile layout and update the test coverage..."
              className="min-h-32 w-full resize-y rounded-xl border border-[#394431] bg-[#0d120b] px-3 py-3 text-sm text-[#edf2e8] placeholder:text-[#6e7967] outline-none focus:border-rose-300"
            />
            <DialogFooter>
              <button type="button" onClick={() => setIsRecheckOpen(false)} className="px-4 py-2 text-sm font-bold text-[#aeb8a6]">
                Cancel
              </button>
              <button type="submit" disabled={isActionSubmitting || !recheckFeedback.trim()} className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-extrabold text-[#1b090a] disabled:opacity-50">
                Send back
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFocusSetupOpen} onOpenChange={setIsFocusSetupOpen}>
        <DialogContent className="border-[#394431] bg-[#11170f] text-[#edf2e8] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Focus Session</DialogTitle>
            <p className="text-sm text-[#9da996]">Work on one task without distractions.</p>
          </DialogHeader>
          <div className="mt-3 space-y-4">
            <div className="rounded-xl border border-[#394431] bg-[#0d120b] px-4 py-3 text-sm font-bold">{selectedFocusTask?.title}</div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Session duration</p>
              <div className="space-y-2">
                {[
                  [25, "25 minutes"],
                  [50, "50 minutes"],
                  [0, "No time limit"],
                ].map(([minutes, label]) => (
                  <button
                    key={String(minutes)}
                    type="button"
                    onClick={() => setFocusDuration(minutes as number)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition",
                      focusDuration === minutes
                        ? "border-[#a8c765] bg-[#1a2514] text-[#e5efd9]"
                        : "border-[#394431] bg-[#0d120b] text-[#aeb8a6] hover:border-[#607052]"
                    )}
                  >
                    <span className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      focusDuration === minutes ? "border-[#a8c765]" : "border-[#687561]"
                    )}>
                      {focusDuration === minutes && <span className="h-2 w-2 rounded-full bg-[#a8c765]" />}
                    </span>
                    {label as string}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#aeb8a6]">Optional notes</label>
              <textarea
                value={focusNotes}
                onChange={(event) => setFocusNotes(event.target.value)}
                placeholder="Anything to remember for this session?"
                className="min-h-24 w-full resize-y rounded-xl border border-[#394431] bg-[#0d120b] px-3 py-3 text-sm text-[#edf2e8] placeholder:text-[#6e7967] outline-none focus:border-[#94ad55]"
              />
            </div>
            <button type="button" onClick={() => setFocusBusy((current) => !current)} className="flex items-center gap-3 text-sm text-[#c8d1c2]">
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                focusBusy ? "border-[#a8c765] bg-[#a8c765] text-[#0b0f0b]" : "border-[#53604b]"
              )}>
                {focusBusy && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </span>
              Automatically mark me as busy
            </button>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setIsFocusSetupOpen(false)} className="px-4 py-2 text-sm font-bold text-[#aeb8a6]">
              Cancel
            </button>
            <button type="button" onClick={startFocus} disabled={isActionSubmitting || !selectedFocusTask} className="rounded-lg bg-[#a8c765] px-4 py-2 text-sm font-extrabold text-[#0b0f0b] disabled:opacity-50">
              Start focus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastElement}
    </div>
  );
}
