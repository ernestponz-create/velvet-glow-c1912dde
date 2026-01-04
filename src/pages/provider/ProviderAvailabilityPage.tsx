import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addHours, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, X } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  slot_type: 'available' | 'blocked' | 'booked';
  resource_id?: string;
  block_reason?: string;
  block_note?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
}

const blockReasons = [
  "Lunch Break",
  "Personal Time",
  "Holiday",
  "Training",
  "Equipment Maintenance",
  "Other"
];

const ProviderAvailabilityPage = () => {
  const { providerProfile } = useProviderAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [slotType, setSlotType] = useState<'available' | 'blocked'>('available');
  const [blockReason, setBlockReason] = useState('');
  const [blockNote, setBlockNote] = useState('');

  const fetchResources = useCallback(async () => {
    if (!providerProfile) return;

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("provider_id", providerProfile.id);

    if (data && data.length > 0) {
      setResources(data);
    } else if (!error) {
      setShowSetupModal(true);
    }
  }, [providerProfile]);

  const fetchSlots = useCallback(async () => {
    if (!providerProfile) return;

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("provider_id", providerProfile.id);

    if (data) {
      const calendarEvents: CalendarEvent[] = data.map(slot => ({
        id: slot.id,
        title: slot.slot_type === 'available' ? 'Available' : 
               slot.slot_type === 'booked' ? 'Booked' : 
               slot.block_reason || 'Blocked',
        start: new Date(slot.start_time),
        end: new Date(slot.end_time),
        slot_type: slot.slot_type as 'available' | 'blocked' | 'booked',
        resource_id: slot.resource_id,
        block_reason: slot.block_reason,
        block_note: slot.block_note
      }));
      setEvents(calendarEvents);
    }
    setIsLoading(false);
  }, [providerProfile]);

  useEffect(() => {
    if (providerProfile) {
      fetchResources();
      fetchSlots();
    }
  }, [providerProfile, fetchResources, fetchSlots]);

  // Setup default resource (for solo practitioners)
  const setupDefaultResource = async () => {
    if (!providerProfile) return;

    const { error } = await supabase
      .from("resources")
      .insert({
        provider_id: providerProfile.id,
        name: providerProfile.clinic_name,
        type: 'practitioner'
      });

    if (!error) {
      toast({ title: "Setup Complete", description: "You can now manage your availability" });
      setShowSetupModal(false);
      fetchResources();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setSlotType('available');
    setBlockReason('');
    setBlockNote('');
    setShowSlotModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setSlotType(event.slot_type === 'booked' ? 'blocked' : event.slot_type);
    setBlockReason(event.block_reason || '');
    setBlockNote(event.block_note || '');
    setShowSlotModal(true);
  };

  const saveSlot = async () => {
    if (!providerProfile || (!selectedSlot && !selectedEvent)) return;

    const slotData = {
      provider_id: providerProfile.id,
      resource_id: resources[0]?.id || null,
      start_time: selectedSlot?.start.toISOString() || selectedEvent?.start.toISOString(),
      end_time: selectedSlot?.end.toISOString() || selectedEvent?.end.toISOString(),
      slot_type: slotType,
      block_reason: slotType === 'blocked' ? blockReason : null,
      block_note: slotType === 'blocked' ? blockNote : null
    };

    let error;
    if (selectedEvent) {
      const { error: updateError } = await supabase
        .from("availability_slots")
        .update(slotData)
        .eq("id", selectedEvent.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("availability_slots")
        .insert(slotData);
      error = insertError;
    }

    if (!error) {
      toast({ title: "Saved", description: "Availability updated" });
      setShowSlotModal(false);
      fetchSlots();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteSlot = async () => {
    if (!selectedEvent) return;

    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", selectedEvent.id);

    if (!error) {
      toast({ title: "Deleted", description: "Slot removed" });
      setShowSlotModal(false);
      fetchSlots();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#22c55e'; // green for available
    let borderColor = '#16a34a';
    
    if (event.slot_type === 'blocked') {
      backgroundColor = '#6b7280';
      borderColor = '#4b5563';
    } else if (event.slot_type === 'booked') {
      backgroundColor = '#3b82f6';
      borderColor = '#2563eb';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        color: 'white',
        fontSize: '12px'
      }
    };
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[600px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-1">
            My Availability
          </h1>
          <p className="text-white/60">Click and drag to add available slots or block time</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView(Views.DAY)}
            className={currentView === Views.DAY ? 'bg-[#d4af37] text-[#1a1a2e] border-[#d4af37]' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView(Views.WEEK)}
            className={currentView === Views.WEEK ? 'bg-[#d4af37] text-[#1a1a2e] border-[#d4af37]' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView(Views.MONTH)}
            className={currentView === Views.MONTH ? 'bg-[#d4af37] text-[#1a1a2e] border-[#d4af37]' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-white/70 text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-white/70 text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500" />
          <span className="text-white/70 text-sm">Blocked</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden">
        <style>{`
          .rbc-calendar {
            background: transparent;
            color: white;
          }
          .rbc-toolbar {
            margin-bottom: 16px;
          }
          .rbc-toolbar button {
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            background: transparent;
            padding: 8px 16px;
            border-radius: 8px;
          }
          .rbc-toolbar button:hover {
            background: rgba(255,255,255,0.1);
          }
          .rbc-toolbar button.rbc-active {
            background: #d4af37;
            color: #1a1a2e;
            border-color: #d4af37;
          }
          .rbc-header {
            color: white;
            border-color: rgba(255,255,255,0.1);
            padding: 12px 8px;
            font-weight: 500;
          }
          .rbc-time-view, .rbc-month-view {
            border-color: rgba(255,255,255,0.1);
          }
          .rbc-day-bg, .rbc-time-content {
            border-color: rgba(255,255,255,0.1);
          }
          .rbc-today {
            background: rgba(212,175,55,0.1);
          }
          .rbc-time-slot {
            border-color: rgba(255,255,255,0.05);
          }
          .rbc-timeslot-group {
            border-color: rgba(255,255,255,0.1);
          }
          .rbc-time-gutter .rbc-label {
            color: rgba(255,255,255,0.5);
            font-size: 11px;
          }
          .rbc-date-cell {
            color: white;
            padding: 4px 8px;
          }
          .rbc-off-range-bg {
            background: rgba(0,0,0,0.2);
          }
          .rbc-current-time-indicator {
            background: #d4af37;
          }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          step={30}
          timeslots={2}
          defaultView={Views.WEEK}
          min={new Date(2024, 0, 1, 7, 0)}
          max={new Date(2024, 0, 1, 21, 0)}
        />
      </div>

      {/* Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Set Up Your Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-white/70">
              {providerProfile?.practice_type === 'solo' 
                ? "As a solo practitioner, we'll set up a simple calendar just for you."
                : "Let's add your first resource (staff member or room)."}
            </p>
            <Button
              onClick={setupDefaultResource}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e]"
            >
              {providerProfile?.practice_type === 'solo' 
                ? "Set Up My Calendar"
                : "Add Myself as First Resource"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slot Modal */}
      <Dialog open={showSlotModal} onOpenChange={setShowSlotModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedEvent ? 'Edit Time Slot' : 'Add Time Slot'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Time Display */}
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>
                  {format(selectedSlot?.start || selectedEvent?.start || new Date(), 'EEE, MMM d')}
                </span>
              </div>
              <p className="text-white font-medium mt-1">
                {format(selectedSlot?.start || selectedEvent?.start || new Date(), 'h:mm a')} - {' '}
                {format(selectedSlot?.end || selectedEvent?.end || new Date(), 'h:mm a')}
              </p>
            </div>

            {/* Slot Type */}
            {selectedEvent?.slot_type !== 'booked' && (
              <div className="space-y-2">
                <Label className="text-white/80">Slot Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSlotType('available')}
                    className={slotType === 'available' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'border-white/20 text-white/70 hover:bg-white/10'}
                  >
                    Available
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSlotType('blocked')}
                    className={slotType === 'blocked' 
                      ? 'bg-gray-500/20 border-gray-500 text-gray-300' 
                      : 'border-white/20 text-white/70 hover:bg-white/10'}
                  >
                    Block Time
                  </Button>
                </div>
              </div>
            )}

            {/* Block Reason */}
            {slotType === 'blocked' && (
              <>
                <div className="space-y-2">
                  <Label className="text-white/80">Reason</Label>
                  <Select value={blockReason} onValueChange={setBlockReason}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/20">
                      {blockReasons.map(r => (
                        <SelectItem key={r} value={r} className="text-white hover:bg-white/10">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Note (optional)</Label>
                  <Textarea
                    value={blockNote}
                    onChange={(e) => setBlockNote(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Add a note..."
                  />
                </div>
              </>
            )}

            {selectedEvent?.slot_type === 'booked' && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-blue-300 text-sm">
                  This slot is booked and cannot be modified.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {selectedEvent && selectedEvent.slot_type !== 'booked' && (
                <Button
                  variant="outline"
                  onClick={deleteSlot}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => setShowSlotModal(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              {selectedEvent?.slot_type !== 'booked' && (
                <Button
                  onClick={saveSlot}
                  className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e]"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderAvailabilityPage;
