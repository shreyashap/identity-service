import { prisma } from '../config/prisma.js';
import { Contact } from '../../generated/prisma/client';

export class ContactRepository {
  async findByEmail(email: string): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: { email },
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: { phoneNumber },
    });
  }

  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    if (!email && !phoneNumber) return [];

    return prisma.contact.findMany({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });
  }

  async findById(id: number): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  async findAllLinkedContacts(primaryId: number): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryId },
          { linkedId: primaryId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: {
    email?: string | null;
    phoneNumber?: string | null;
    linkedId?: number | null;
    linkPrecedence: 'primary' | 'secondary';
  }): Promise<Contact> {
    return prisma.contact.create({
      data,
    });
  }

  async update(id: number, data: {
    linkedId?: number | null;
    linkPrecedence?: 'primary' | 'secondary';
  }): Promise<Contact> {
    return prisma.contact.update({
      where: { id },
      data,
    });
  }

  async updateMany(ids: number[], data: {
    linkedId?: number | null;
    linkPrecedence?: 'primary' | 'secondary';
  }) {
    return prisma.contact.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }
}

export const contactRepository = new ContactRepository();
