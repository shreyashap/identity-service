import * as contactRepository from '../repositories/contact.repository.js';
import { Contact } from '../../generated/prisma/client';

export interface IdentifyResponse {
    contact: {
        primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}

const formatResponse = (contacts: Contact[], primaryId: number): IdentifyResponse => {
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    const primaryContact = contacts.find(c => c.id === primaryId);
    if (primaryContact) {
        if (primaryContact.email) emails.add(primaryContact.email);
        if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
    }

    contacts.forEach(c => {
        if (c.email) emails.add(c.email);
        if (c.phoneNumber) phoneNumbers.add(c.phoneNumber);
        if (c.id !== primaryId) {
            secondaryContactIds.push(c.id);
        }
    });

    return {
        contact: {
            primaryContactId: primaryId,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phoneNumbers),
            secondaryContactIds: secondaryContactIds,
        },
    };
};

export const identifyCustomer = async (email?: string, phoneNumber?: string): Promise<IdentifyResponse> => {
    const matchingContacts = await contactRepository.findByEmailOrPhone(email, phoneNumber);

    if (matchingContacts.length === 0) {
        const newContact = await contactRepository.createContact({
            email,
            phoneNumber,
            linkPrecedence: 'primary',
        });

        return formatResponse([newContact], newContact.id);
    }

    // Identify all primary contacts involved
    const primaryIds = new Set<number>();
    matchingContacts.forEach(c => {
        primaryIds.add(c.linkedId || c.id);
    });

    let allRelatedContacts: Contact[] = [];
    for (const pId of primaryIds) {
        const cluster = await contactRepository.findAllLinkedContacts(pId);
        allRelatedContacts = [...allRelatedContacts, ...cluster];
    }

    // De-duplicate contacts by ID
    const uniqueContactsMap = new Map<number, Contact>();
    allRelatedContacts.forEach(c => uniqueContactsMap.set(c.id, c));
    allRelatedContacts = Array.from(uniqueContactsMap.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // The oldest contact in the entire set is the primary
    const ultimatePrimary = allRelatedContacts[0];
    if (!ultimatePrimary) {
        throw new Error("Critical error: No primary contact found.");
    }
    const ultimatePrimaryId = ultimatePrimary.id;

    // 3. Mark all other "primary" contacts as "secondary" and link them to the ultimate primary
    const otherPrimaryContacts = allRelatedContacts.filter(c => c.linkPrecedence === 'primary' && c.id !== ultimatePrimaryId);

    for (const contactToUpdate of otherPrimaryContacts) {
        await contactRepository.updateContact(contactToUpdate.id, {
            linkedId: ultimatePrimaryId,
            linkPrecedence: 'secondary'
        });
        contactToUpdate.linkedId = ultimatePrimaryId;
        contactToUpdate.linkPrecedence = 'secondary';
    }

    const emailsInCluster = new Set(allRelatedContacts.map(c => c.email).filter(Boolean));
    const phonesInCluster = new Set(allRelatedContacts.map(c => c.phoneNumber).filter(Boolean));

    const isNewEmail = !!(email && !emailsInCluster.has(email));
    const isNewPhone = !!(phoneNumber && !phonesInCluster.has(phoneNumber));

    if (isNewEmail || isNewPhone) {
        const newSecondary = await contactRepository.createContact({
            email,
            phoneNumber,
            linkedId: ultimatePrimaryId,
            linkPrecedence: 'secondary',
        });
        allRelatedContacts.push(newSecondary);
    }

    return formatResponse(allRelatedContacts, ultimatePrimaryId);
};
