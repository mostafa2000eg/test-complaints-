// Utility function for generating unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize default data structure if not exists
const initializeStorage = () => {
  if (!localStorage.getItem('complaints')) {
    localStorage.setItem('complaints', JSON.stringify([]));
  }
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify([]));
  }
  if (!localStorage.getItem('attachments')) {
    localStorage.setItem('attachments', JSON.stringify([]));
  }
  if (!localStorage.getItem('correspondence')) {
    localStorage.setItem('correspondence', JSON.stringify([]));
  }
  if (!localStorage.getItem('auditLog')) {
    localStorage.setItem('auditLog', JSON.stringify([]));
  }
};

// Local Storage Service
const localStorageService = {
  // Initialize
  init: () => {
    initializeStorage();
  },

  // Complaints
  getComplaints: () => {
    return JSON.parse(localStorage.getItem('complaints') || '[]');
  },

  addComplaint: (complaintData) => {
    const complaints = localStorageService.getComplaints();
    const newComplaint = {
      ...complaintData,
      id: generateId(),
      dateReceived: new Date().toISOString(),
    };
    complaints.push(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    return newComplaint;
  },

  updateComplaint: (id, complaintData) => {
    const complaints = localStorageService.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], ...complaintData };
      localStorage.setItem('complaints', JSON.stringify(complaints));
      return complaints[index];
    }
    return null;
  },

  // Customers
  getCustomers: () => {
    return JSON.parse(localStorage.getItem('customers') || '[]');
  },

  addOrUpdateCustomer: (customerData) => {
    const customers = localStorageService.getCustomers();
    const index = customers.findIndex(c => c.subscriberId === customerData.subscriberId);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...customerData };
    } else {
      customers.push({ ...customerData, id: generateId() });
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    return customers[index !== -1 ? index : customers.length - 1];
  },

  // Attachments
  getAttachments: (complaintId) => {
    const attachments = JSON.parse(localStorage.getItem('attachments') || '[]');
    return complaintId ? attachments.filter(a => a.complaintId === complaintId) : attachments;
  },

  addAttachment: (attachmentData) => {
    const attachments = localStorageService.getAttachments();
    const newAttachment = {
      ...attachmentData,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    };
    attachments.push(newAttachment);
    localStorage.setItem('attachments', JSON.stringify(attachments));
    return newAttachment;
  },

  deleteAttachment: (id) => {
    const attachments = localStorageService.getAttachments();
    const filteredAttachments = attachments.filter(a => a.id !== id);
    localStorage.setItem('attachments', JSON.stringify(filteredAttachments));
  },

  // Correspondence
  getCorrespondence: (complaintId) => {
    const correspondence = JSON.parse(localStorage.getItem('correspondence') || '[]');
    return complaintId ? correspondence.filter(c => c.complaintId === complaintId) : correspondence;
  },

  addCorrespondence: (correspondenceData) => {
    const correspondence = localStorageService.getCorrespondence();
    const newCorrespondence = {
      ...correspondenceData,
      id: generateId(),
      date: new Date().toISOString(),
    };
    correspondence.push(newCorrespondence);
    localStorage.setItem('correspondence', JSON.stringify(correspondence));
    return newCorrespondence;
  },

  deleteCorrespondence: (id) => {
    const correspondence = localStorageService.getCorrespondence();
    const filteredCorrespondence = correspondence.filter(c => c.id !== id);
    localStorage.setItem('correspondence', JSON.stringify(filteredCorrespondence));
  },

  // Audit Log
  addAuditLog: (logData) => {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    const newLog = {
      ...logData,
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: 'local-user', // Since we're not using authentication
    };
    auditLog.push(newLog);
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
    return newLog;
  },

  getAuditLog: (entityId) => {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    return entityId ? auditLog.filter(log => log.entityId === entityId) : auditLog;
  },

  // Data Export/Import
  exportData: () => {
    const data = {
      complaints: localStorageService.getComplaints(),
      customers: localStorageService.getCustomers(),
      attachments: localStorageService.getAttachments(),
      correspondence: localStorageService.getCorrespondence(),
      auditLog: localStorageService.getAuditLog(),
    };
    return JSON.stringify(data);
  },

  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem('complaints', JSON.stringify(data.complaints || []));
      localStorage.setItem('customers', JSON.stringify(data.customers || []));
      localStorage.setItem('attachments', JSON.stringify(data.attachments || []));
      localStorage.setItem('correspondence', JSON.stringify(data.correspondence || []));
      localStorage.setItem('auditLog', JSON.stringify(data.auditLog || []));
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
};

export default localStorageService;