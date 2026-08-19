import { useEffect } from 'react'
import type { BookingLink } from '@common/features/booking/types/BookingTypes'
import { userAttendee } from '@common/features/User/models/attendee'
import type { Resource } from '@common/components/Attendees/ResourceSearch'
import { fetchUserById } from '@common/features/User/UserDao'
import { fetchResourceById } from '@common/features/User/ResourceDAO'

export interface UseResolveBookingLinkEntitiesOptions {
  isOpen: boolean
  bookingLink?: BookingLink
  setAttendees: (attendees: userAttendee[]) => void
  setSelectedResources: (resources: Resource[]) => void
}

async function resolveAttendee(id: string): Promise<userAttendee> {
  try {
    const user = await fetchUserById(id)
    const email = user.preferredEmail ?? user.emails?.[0] ?? id
    const displayName =
      [user.firstname, user.lastname].filter(Boolean).join(' ') || email
    return new userAttendee({
      cal_address: email,
      openpaasId: user.id ?? id,
      cn: displayName
    })
  } catch {
    // fallback: keep raw id
    return new userAttendee({
      cal_address: id,
      openpaasId: id,
      cn: id
    })
  }
}

async function resolveResource(id: string): Promise<Resource> {
  try {
    const resource = await fetchResourceById(id)
    return {
      displayName: resource.name ?? id,
      openpaasId: resource._id ?? id
    } satisfies Resource
  } catch {
    // fallback: keep raw id
    return { displayName: id, openpaasId: id } satisfies Resource
  }
}

async function resolveBookingAttendees(
  bookingLink: BookingLink
): Promise<userAttendee[]> {
  const attendeeIds =
    bookingLink.extraAttendees?.and?.map(p => p.participant) ?? []
  if (attendeeIds.length === 0) return []
  return Promise.all(attendeeIds.map(resolveAttendee))
}

async function resolveBookingResources(
  bookingLink: BookingLink
): Promise<Resource[]> {
  const resourceIds = bookingLink.resources ?? []
  if (resourceIds.length === 0) return []
  return Promise.all(resourceIds.map(resolveResource))
}

export function useResolveBookingLinkEntities({
  isOpen,
  bookingLink,
  setAttendees,
  setSelectedResources
}: UseResolveBookingLinkEntitiesOptions): void {
  // Resolve attendee and resource IDs into full user/resource details
  useEffect(() => {
    let isCurrent = true

    if (!isOpen || !bookingLink) return

    const loadEntities = async (): Promise<void> => {
      const [attendees, resources] = await Promise.all([
        resolveBookingAttendees(bookingLink),
        resolveBookingResources(bookingLink)
      ])

      if (isCurrent) {
        if (attendees.length > 0) setAttendees(attendees)
        if (resources.length > 0) setSelectedResources(resources)
      }
    }

    void loadEntities()

    return (): void => {
      isCurrent = false
    }
  }, [isOpen, bookingLink, setAttendees, setSelectedResources])
}
