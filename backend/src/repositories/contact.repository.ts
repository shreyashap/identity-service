import { prisma } from '../config/prisma.js';
import { Contact } from '../../generated/prisma/client';

export const findByEmail = async (email: string): Promise<Contact[]> => {
  return prisma.contact.findMany({
    where: { email },
  });
};

export const findByPhoneNumber = async (phoneNumber: string): Promise<Contact[]> => {
  return prisma.contact.findMany({
    where: { phoneNumber },
  });
};

export const findByEmailOrPhone = async (email?: string, phoneNumber?: string): Promise<Contact[]> => {
  if (!email && !phoneNumber) return [];

  return prisma.contact.findMany({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });
};

export const findById = async (id: number): Promise<Contact | null> => {
  return prisma.contact.findUnique({
    where: { id },
  });
};

export const findAllLinkedContacts = async (primaryId: number): Promise<Contact[]> => {
  return prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryId },
        { linkedId: primaryId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createContact = async (data: {
  email?: string | null;
  phoneNumber?: string | null;
  linkedId?: number | null;
  linkPrecedence: 'primary' | 'secondary';
}): Promise<Contact> => {
  return prisma.contact.create({
    data,
  });
};

export const updateContact = async (id: number, data: {
  linkedId?: number | null;
  linkPrecedence?: 'primary' | 'secondary';
}): Promise<Contact> => {
  return prisma.contact.update({
    where: { id },
    data,
  });
};

export const updateManyContacts = async (ids: number[], data: {
  linkedId?: number | null;
  linkPrecedence?: 'primary' | 'secondary';
}) => {
  return prisma.contact.updateMany({
    where: { id: { in: ids } },
    data,
  });
};
