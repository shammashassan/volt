import { ObjectId } from 'mongodb';

export type UserId = string;
export type ReminderId = string;
export type NotificationId = string;
export type NoteId = string;
export type ProjectId = string;
export type ResourceId = string;
export type PersonId = string;
export type WatchlistId = string;

export interface BaseDocument {
  _id?: string | ObjectId;
  userId: UserId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
