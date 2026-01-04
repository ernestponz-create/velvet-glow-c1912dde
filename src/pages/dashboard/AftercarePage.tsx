import { useState, useEffect } from "react";
import { Heart, CheckCircle2, Circle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  due_at: string;
  booking_id: string | null;
}

const AftercarePage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("due_at", { ascending: true });
      
      setTasks(data || []);
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const handleComplete = async (taskId: string) => {
    await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: "completed" } : t
    ));
  };

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="px-4 pb-24 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-xl font-medium">Aftercare</h1>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No aftercare tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks will appear after booking treatments
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingTasks.length})
                </h2>
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-card p-4 border-primary/10"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="mt-0.5 w-5 h-5 rounded-full border-2 border-muted-foreground/40 hover:border-primary transition-colors flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due {format(new Date(task.due_at), "MMM d")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed ({completedTasks.length})
                </h2>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-card p-3 border-primary/5 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground line-through truncate">
                          {task.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Heart className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight">
            Aftercare
          </h1>
          <p className="text-muted-foreground">
            Post-treatment guidance and recovery tasks
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No aftercare tasks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tasks will appear after booking treatments
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Tasks */}
          <div className="glass-card p-6">
            <h2 className="font-medium text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Pending Tasks
              <span className="ml-auto text-sm text-muted-foreground">
                {pendingTasks.length}
              </span>
            </h2>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                All caught up! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Due {format(new Date(task.due_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => handleComplete(task.id)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Done
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div className="glass-card p-6">
            <h2 className="font-medium text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Completed
              <span className="ml-auto text-sm text-muted-foreground">
                {completedTasks.length}
              </span>
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Complete tasks to see them here
              </p>
            ) : (
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/10"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-through truncate">
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AftercarePage;
