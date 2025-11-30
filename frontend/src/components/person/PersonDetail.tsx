'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Briefcase,
  Users,
  ChevronRight,
  X,
  User,
  Quote
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { LateBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Person, ImmediateFamily } from '@/types';
import { api } from '@/lib/api';
import { formatDate, calculateAge } from '@/lib/utils';

interface PersonDetailProps {
  person: Person;
  onClose?: () => void;
  onPersonClick?: (personId: string) => void;
}

export function PersonDetail({ person, onClose, onPersonClick }: PersonDetailProps) {
  const [family, setFamily] = useState<ImmediateFamily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFamily() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPersonFamily(person.id);
        setFamily(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load family data';
        setError(message);
        console.error('Failed to load family:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFamily();
  }, [person.id]);

  const age = calculateAge(person.birth_date, person.death_date);

  return (
    <div className="h-full flex flex-col">
      {/* Header with close button */}
      {onClose && (
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Profile Section */}
      <div className="px-6 pb-6 flex flex-col items-center text-center border-b border-border">
        <Avatar person={person} size="xl" className="mb-4" />

        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-foreground">
            {person.name}
          </h2>
          {!person.is_alive && <LateBadge />}
        </div>

        <p className="text-muted text-sm">
          {age} years {person.is_alive ? 'old' : '(at passing)'}
        </p>
      </div>

      {/* Details Section */}
      <div className="px-6 py-4 space-y-4 border-b border-border">
        <DetailRow
          icon={<User className="w-4 h-4" />}
          label="Gender"
          value={person.gender}
        />

        {person.aka && person.aka.length > 0 && (
          <DetailRow
            icon={<Quote className="w-4 h-4" />}
            label="Also known as"
            value={person.aka.join(', ')}
          />
        )}

        <DetailRow
          icon={<Calendar className="w-4 h-4" />}
          label="Born"
          value={formatDate(person.birth_date)}
        />

        {person.death_date && (
          <DetailRow
            icon={<Calendar className="w-4 h-4" />}
            label="Died"
            value={formatDate(person.death_date)}
          />
        )}

        <DetailRow
          icon={<MapPin className="w-4 h-4" />}
          label="Location"
          value={person.current_location}
        />

        <DetailRow
          icon={<Briefcase className="w-4 h-4" />}
          label="Profession"
          value={person.profession}
        />
      </div>

      {/* Immediate Family Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted" />
          <h3 className="font-medium text-foreground">Immediate Family</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                api.getPersonFamily(person.id)
                  .then(setFamily)
                  .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
                  .finally(() => setLoading(false));
              }}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : family ? (
          <div className="space-y-3">
            {/* Parents */}
            {family.parents.length > 0 && (
              <FamilyGroup
                label="Parents"
                members={family.parents}
                onMemberClick={onPersonClick}
              />
            )}

            {/* Spouse */}
            {family.spouse && (
              <FamilyGroup
                label="Spouse"
                members={[family.spouse]}
                onMemberClick={onPersonClick}
              />
            )}

            {/* Siblings */}
            {family.siblings.length > 0 && (
              <FamilyGroup
                label="Siblings"
                members={family.siblings}
                onMemberClick={onPersonClick}
              />
            )}

            {/* Children */}
            {family.children.length > 0 && (
              <FamilyGroup
                label="Children"
                members={family.children}
                onMemberClick={onPersonClick}
              />
            )}
          </div>
        ) : (
          <p className="text-muted text-sm">No family information available.</p>
        )}
      </div>
    </div>
  );
}

// Detail row component
function DetailRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Family group component
function FamilyGroup({
  label,
  members,
  onMemberClick,
}: {
  label: string;
  members: Person[];
  onMemberClick?: (personId: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted mb-2">{label}</p>
      <div className="space-y-2">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onMemberClick?.(member.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors text-left"
          >
            <Avatar person={member} size="sm" />
            <span className="flex-1 text-sm text-foreground">{member.name}</span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
