'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { useNotification, ConfirmationModal } from '@/components/Notification';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Check,
  X,
  Loader2,
  ChevronDown,
  Filter
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  desc: string;
  date: string;
  time?: string;
  islamicDate?: string;
  venue?: string;
  category: string;
  img: string;
  fb?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventRegistration {
  eventId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

interface FamilyMember {
  id?: string | number;
  name?: string;
  membershipNo?: string;
  dob?: string;
}

interface FamilyTree {
  self: FamilyMember;
  spouse: FamilyMember[];
  children: FamilyMember[];
  parents: FamilyMember[];
}

interface MemberInfo {
  MemComputerID: string;
  MemName?: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function EventsPage() {
  const { member: authMember } = useMemberAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSpouse, setSelectedSpouse] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'myregistrations'>('available');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [eventsRes, registrationsRes, familyRes, memberRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/events/register', { credentials: 'include' }),
        fetch('/api/member/family-tree'),
        fetch('/api/member')
      ]);

      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (registrationsRes.ok) setRegistrations(await registrationsRes.json());
      if (familyRes.ok) setFamilyTree(await familyRes.json());
      if (memberRes.ok) setMember(await memberRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    const familyMembers = {
      spouse: selectedSpouse,
      children: selectedChildren,
      parents: selectedParents
    };
    setRegistering(eventId);
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, familyMembers }),
      });
      if (response.ok) {
        const regRes = await fetch('/api/events/register', { credentials: 'include' });
        if (regRes.ok) setRegistrations(await regRes.json());
        showNotification('Registration request submitted successfully!', 'success');
        setShowFamilyModal(false);
        setSelectedEvent(null);
        resetFamilySelection();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to register', 'error');
      }
    } catch (error) {
      console.error('Error registering:', error);
      showNotification('Failed to register for event', 'error');
    } finally {
      setRegistering(null);
    }
  };

  const resetFamilySelection = () => {
    setSelectedSpouse([]);
    setSelectedChildren([]);
    setSelectedParents([]);
  };

  const getRegistrationStatus = (eventId: string) =>
    registrations.find(r => r.eventId === eventId)?.status || null;

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const response = await fetch(`/api/events/${eventToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('Event deleted successfully', 'success');
        setEvents(events.filter(e => e.id !== eventToDelete));
      } else {
        showNotification('Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter(event => new Date(event.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categories = ['all', ...new Set(events.map(e => e.category))];

  const filteredUpcoming = filterCategory === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(e => e.category === filterCategory);

  const filteredPast = filterCategory === 'all'
    ? pastEvents
    : pastEvents.filter(e => e.category === filterCategory);

  const isAdmin = authMember?.role === 'admin';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading events...</p>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: 'bg-primary-yellow-100 text-primary-yellow-700 border-primary-yellow-200',
      approved: 'bg-primary-green-100 text-primary-green-700 border-primary-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      cancelled: 'bg-foreground-100 text-foreground-400 border-foreground-200',
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Registered',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${styles[status] || styles.pending}`}>
        {status === 'approved' && <Check className="w-3 h-3" />}
        {status === 'rejected' && <X className="w-3 h-3" />}
        {labels[status] || status}
      </span>
    );
  };

  const EventCard = ({ event, isPast = false }: { event: Event; isPast?: boolean }) => {
    const date = new Date(event.date);
    const status = getRegistrationStatus(event.id);

    return (
      <div className={`bg-background rounded-xl border-2 border-primary-silver-400 overflow-hidden hover:shadow-lg transition-all ${isPast ? 'opacity-75' : ''}`}>
        {/* Image */}
        <div className="relative h-40 sm:h-48 bg-primary-silver-200">
          {event.img ? (
            <Image
              src={event.img}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-blue-100 to-primary-yellow-100">
              <Calendar className="w-12 h-12 text-primary-blue-300" />
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary-black/70 text-primary-white text-xs font-bold rounded-full">
            {event.category}
          </span>
          {/* Date badge */}
          <div className="absolute top-3 right-3 bg-background rounded-lg px-3 py-2 text-center shadow-lg">
            <p className="text-xs font-bold text-primary-blue uppercase">{MONTHS[date.getMonth()]}</p>
            <p className="text-xl font-bold text-foreground leading-none">{date.getDate()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-1">{event.title}</h3>
          <p className="text-sm text-foreground-300 line-clamp-2 mb-3">{event.desc}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-foreground-300 mb-4">
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.time}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.venue}
              </span>
            )}
            {event.islamicDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {event.islamicDate}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {status ? (
              <StatusBadge status={status} />
            ) : !isPast ? (
              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setShowFamilyModal(true);
                }}
                className="flex-1 py-2.5 bg-primary-blue text-primary-white text-sm font-bold rounded-xl hover:bg-primary-blue-600 transition-colors"
              >
                Register
              </button>
            ) : (
              <span className="text-xs text-foreground-300 font-medium">Event ended</span>
            )}
            {event.fb && (
              <a
                href={event.fb}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 border-2 border-primary-silver-400 rounded-xl hover:bg-primary-silver-200 transition-colors"
                aria-label="View on Facebook"
              >
                <ExternalLink className="w-4 h-4 text-foreground-300" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Events</h1>
        <p className="text-foreground-300 mt-1">View, register, and manage event registrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-primary-silver-400 flex-wrap">
        <button
          onClick={() => {
            setActiveTab('available');
            setFilterCategory('all');
          }}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'available'
              ? 'border-primary-blue text-primary-blue'
              : 'border-transparent text-foreground-300 hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Available Events
            {upcomingEvents.length > 0 && <span className="ml-1 bg-primary-blue-100 text-primary-blue text-xs font-bold px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>}
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('myregistrations');
            setFilterCategory('all');
          }}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'myregistrations'
              ? 'border-primary-blue text-primary-blue'
              : 'border-transparent text-foreground-300 hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            My Registrations
            {registrations.length > 0 && <span className="ml-1 bg-primary-green-100 text-primary-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{registrations.length}</span>}
          </div>
        </button>
      </div>

      {/* Available Events Tab */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Filter */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-background border-2 border-primary-silver-400 rounded-xl text-sm font-semibold text-foreground hover:bg-primary-silver-200 transition-colors w-full sm:w-auto justify-center"
            >
              <Filter className="w-4 h-4" />
              {filterCategory === 'all' ? 'All Categories' : filterCategory}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-background border-2 border-primary-silver-400 rounded-xl shadow-xl z-20 py-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-silver-200 transition-colors ${filterCategory === cat ? 'font-bold text-primary-blue' : 'text-foreground'
                        }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
              <p className="text-2xl font-bold text-primary-blue">{upcomingEvents.length}</p>
              <p className="text-xs font-medium text-foreground-300">Upcoming</p>
            </div>
            <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
              <p className="text-2xl font-bold text-primary-green">
                {registrations.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-xs font-medium text-foreground-300">Registered</p>
            </div>
            <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
              <p className="text-2xl font-bold text-primary-yellow-700">
                {registrations.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-xs font-medium text-foreground-300">Pending</p>
            </div>
          </div>

          {/* Upcoming Events */}
          {filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-8 text-center">
              <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-foreground-200" />
              </div>
              <h3 className="font-bold text-foreground mb-2">No Upcoming Events</h3>
              <p className="text-sm text-foreground-300">Check back later for new events</p>
            </div>
          )}
        </div>
      )}

      {/* My Registrations Tab */}
      {activeTab === 'myregistrations' && (
        <div className="space-y-6">
          {registrations.length === 0 ? (
            <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-8 text-center">
              <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-foreground-200" />
              </div>
              <h3 className="font-bold text-foreground mb-2">No Registrations Yet</h3>
              <p className="text-sm text-foreground-300 mb-6">You haven't registered for any events yet.</p>
              <button
                onClick={() => setActiveTab('available')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-primary-white text-sm font-bold rounded-xl hover:bg-primary-blue-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {events.map((event) => {
                  const status = getRegistrationStatus(event.id);
                  if (!status) return null;
                  return (
                    <div
                      key={event.id}
                      className="bg-background rounded-xl border-2 border-primary-silver-400 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Event Image */}
                        <div className="relative h-40 sm:h-32 sm:w-48 flex-shrink-0 rounded-lg overflow-hidden bg-primary-silver-200">
                          {event.img ? (
                            <Image
                              src={event.img}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-blue-100 to-primary-yellow-100">
                              <Calendar className="w-8 h-8 text-primary-blue-300" />
                            </div>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="font-bold text-foreground text-lg">{event.title}</h3>
                              <p className="text-sm text-foreground-300">{event.category}</p>
                            </div>
                            <StatusBadge status={status} />
                          </div>

                          <p className="text-sm text-foreground-300 line-clamp-1 mb-3">{event.desc}</p>

                          <div className="flex flex-wrap gap-3 text-xs text-foreground-300">
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {event.time}
                              </span>
                            )}
                            {event.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(el => el)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Family Selection Modal */}
      {showFamilyModal && selectedEvent && (
        <div className="fixed inset-0 bg-primary-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-primary-silver-400">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-foreground">Register for Event</h3>
                <button
                  onClick={() => {
                    setShowFamilyModal(false);
                    setSelectedEvent(null);
                    resetFamilySelection();
                  }}
                  className="p-2 hover:bg-primary-silver-200 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-foreground-300" />
                </button>
              </div>
              <p className="text-sm text-foreground-300">{selectedEvent.title}</p>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-sm font-semibold text-foreground mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Select family members to include:
              </p>

              <div className="space-y-2">
                {/* Self - always included */}
                <div className="flex items-center gap-3 p-3 bg-primary-blue-50 rounded-xl border-2 border-primary-blue-200">
                  <Check className="w-5 h-5 text-primary-blue" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{member?.MemName || 'You'}</p>
                    <p className="text-xs text-foreground-300">Primary registrant</p>
                  </div>
                </div>

                {/* Spouse */}
                {familyTree?.spouse?.filter(s => String(s.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((spouse, idx) => {
                  const spouseId = String(spouse.id || '');
                  return (
                    <label key={`spouse-${idx}`} className="flex items-center gap-3 p-3 bg-primary-silver-100 rounded-xl border-2 border-transparent hover:border-primary-blue cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-primary-blue rounded"
                        checked={selectedSpouse.includes(spouseId)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSpouse(prev => [...prev, spouseId]);
                          else setSelectedSpouse(prev => prev.filter(id => id !== spouseId));
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{spouse.name}</p>
                        <p className="text-xs text-foreground-300">Spouse</p>
                      </div>
                    </label>
                  );
                })}

                {/* Children */}
                {familyTree?.children?.filter(c => String(c.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((child, idx) => {
                  const childId = String(child.id || '');
                  return (
                    <label key={`child-${idx}`} className="flex items-center gap-3 p-3 bg-primary-silver-100 rounded-xl border-2 border-transparent hover:border-primary-blue cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-primary-blue rounded"
                        checked={selectedChildren.includes(childId)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedChildren(prev => [...prev, childId]);
                          else setSelectedChildren(prev => prev.filter(id => id !== childId));
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{child.name}</p>
                        <p className="text-xs text-foreground-300">Child</p>
                      </div>
                    </label>
                  );
                })}

                {/* Parents */}
                {familyTree?.parents?.filter(p => String(p.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((parent, idx) => {
                  const parentId = String(parent.id || '');
                  return (
                    <label key={`parent-${idx}`} className="flex items-center gap-3 p-3 bg-primary-silver-100 rounded-xl border-2 border-transparent hover:border-primary-blue cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-primary-blue rounded"
                        checked={selectedParents.includes(parentId)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedParents(prev => [...prev, parentId]);
                          else setSelectedParents(prev => prev.filter(id => id !== parentId));
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{parent.name}</p>
                        <p className="text-xs text-foreground-300">Parent</p>
                      </div>
                    </label>
                  );
                })}

                {(!familyTree?.spouse?.length && !familyTree?.children?.length && !familyTree?.parents?.length) && (
                  <p className="text-sm text-foreground-300 text-center py-4">
                    No family members found. You will be registered individually.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t-2 border-primary-silver-400 flex gap-3">
              <button
                onClick={() => {
                  setShowFamilyModal(false);
                  setSelectedEvent(null);
                  resetFamilySelection();
                }}
                className="flex-1 py-3 border-2 border-primary-silver-400 text-foreground text-sm font-bold rounded-xl hover:bg-primary-silver-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={registering === selectedEvent.id}
                onClick={() => handleRegister(selectedEvent.id)}
                className="flex-1 py-3 bg-primary-blue text-primary-white text-sm font-bold rounded-xl hover:bg-primary-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {registering === selectedEvent.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Confirm Registration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
}
