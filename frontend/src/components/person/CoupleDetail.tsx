'use client';

import {
  Calendar,
  MapPin,
  Heart,
  Users,
  ChevronRight,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CoupleSelection, Person } from '@/types';
import { formatDate } from '@/lib/utils';

interface CoupleDetailProps {
  couple: CoupleSelection;
  onClose?: () => void;
  onPersonClick?: (personId: string) => void;
}

export function CoupleDetail({ couple, onClose, onPersonClick }: CoupleDetailProps) {
  const { person1, person2, marriageDate, children, person1Parents, person2Parents } = couple;

  // Get locations - show both if different
  const locations = getUniqueLocations(person1, person2);

  return (
    <div className="h-full flex flex-col">
      {/* Header with close button */}
      {onClose && (
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Couple Profile Section */}
      <div className="px-6 pb-6 flex flex-col items-center text-center border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Avatar person={person1} size="lg" />
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <Avatar person={person2} size="lg" />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-1">
          {person1.name.split(' ')[0]} & {person2.name.split(' ')[0]}
        </h2>

        {marriageDate && (
          <p className="text-muted text-sm">
            Married since {formatDate(marriageDate).split(',')[0]}
          </p>
        )}
      </div>

      {/* Details Section */}
      <div className="px-6 py-4 space-y-4 border-b border-border">
        {marriageDate && (
          <DetailRow
            icon={<Calendar className="w-4 h-4" />}
            label="Marriage Date"
            value={formatDate(marriageDate)}
          />
        )}

        <DetailRow
          icon={<MapPin className="w-4 h-4" />}
          label={locations.length > 1 ? 'Locations' : 'Location'}
          value={locations.join(' & ')}
        />
      </div>

      {/* Children & Parents Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Children */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted" />
            <h3 className="font-medium text-foreground">
              Children {children.length > 0 && `(${children.length})`}
            </h3>
          </div>

          {children.length > 0 ? (
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onPersonClick?.(child.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors text-left"
                >
                  <Avatar person={child} size="sm" />
                  <span className="flex-1 text-sm text-foreground">{child.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No children</p>
          )}
        </div>

        {/* Person 1's Parents */}
        {person1Parents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted" />
              <h3 className="font-medium text-foreground">
                {person1.name.split(' ')[0]}&apos;s Parents
              </h3>
            </div>
            <div className="space-y-2">
              {person1Parents.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => onPersonClick?.(parent.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors text-left"
                >
                  <Avatar person={parent} size="sm" />
                  <span className="flex-1 text-sm text-foreground">{parent.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Person 2's Parents */}
        {person2Parents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted" />
              <h3 className="font-medium text-foreground">
                {person2.name.split(' ')[0]}&apos;s Parents
              </h3>
            </div>
            <div className="space-y-2">
              {person2Parents.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => onPersonClick?.(parent.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors text-left"
                >
                  <Avatar person={parent} size="sm" />
                  <span className="flex-1 text-sm text-foreground">{parent.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Individual Profiles */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted mb-3">View individual profiles</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onPersonClick?.(person1.id)}
          >
            {person1.name.split(' ')[0]}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onPersonClick?.(person2.id)}
          >
            {person2.name.split(' ')[0]}
          </Button>
        </div>
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

// Helper to get unique locations
function getUniqueLocations(person1: Person, person2: Person): string[] {
  const loc1 = person1.current_location;
  const loc2 = person2.current_location;

  if (loc1 === loc2) {
    return [loc1];
  }

  return [loc1, loc2].filter(Boolean);
}
