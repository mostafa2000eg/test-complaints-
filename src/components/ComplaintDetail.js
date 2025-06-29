function ComplaintDetail({ complaint, setCurrentPage }) {
  const { userId, localStorageService } = useContext(AppContext);
  const [customer, setCustomer] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [correspondence, setCorrespondence] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [showAddCorrespondenceModal, setShowAddCorrespondenceModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load all related data when component mounts
  useEffect(() => {
    if (!complaint) return;

    setLoading(true);
    setError(null);

    try {
      // Get customer data
      const customers = localStorageService.getCustomers();
      const customerData = customers.find(c => c.subscriberId === complaint.subscriberId);
      setCustomer(customerData || null);

      // Get attachments
      const complaintAttachments = localStorageService.getAttachments(complaint.id);
      setAttachments(complaintAttachments);

      // Get correspondence
      const complaintCorrespondence = localStorageService.getCorrespondence(complaint.id);
      setCorrespondence(complaintCorrespondence);

      // Get audit log
      const complaintAuditLog = localStorageService.getAuditLog(complaint.id);
      setAuditLog(complaintAuditLog);

      setLoading(false);
    } catch (err) {
      console.error("Error loading complaint details:", err);
      setError("حدث خطأ أثناء تحميل تفاصيل الشكوى.");
      setLoading(false);
    }
  }, [complaint]);

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المرفق؟')) {
      return;
    }

    try {
      localStorageService.deleteAttachment(attachmentId);
      
      // Add to audit log
      localStorageService.addAuditLog({
        entityType: 'attachment',
        entityId: attachmentId,
        details: `تم حذف مرفق من الشكوى رقم: ${complaint.id}`,
      });

      // Update attachments list
      setAttachments(localStorageService.getAttachments(complaint.id));
      
      setMessage('تم حذف المرفق بنجاح!');
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting attachment:", error);
      setMessage('حدث خطأ أثناء حذف المرفق');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteCorrespondence = async (correspondenceId) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه المراسلة؟')) {
      return;
    }

    try {
      localStorageService.deleteCorrespondence(correspondenceId);
      
      // Add to audit log
      localStorageService.addAuditLog({
        entityType: 'correspondence',
        entityId: correspondenceId,
        details: `تم حذف مراسلة من الشكوى رقم: ${complaint.id}`,
      });

      // Update correspondence list
      setCorrespondence(localStorageService.getCorrespondence(complaint.id));
      
      setMessage('تم حذف المراسلة بنجاح!');
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting correspondence:", error);
      setMessage('حدث خطأ أثناء حذف المراسلة');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDownloadAttachment = (base64Content, fileName) => {
    const link = document.createElement('a');
    link.href = base64Content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage('تم بدء تنزيل الملف.');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="text-center py-8 text-gray-600">جاري تحميل التفاصيل...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!complaint) return <div className="text-center py-8 text-gray-600">لا توجد تفاصيل للعرض.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">تفاصيل الشكوى</h2>
      {message && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-start space-x-4 space-x-reverse mb-6">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          العودة للرئيسية
        </button>
        <button
          onClick={() => {
            setCurrentPage('addComplaint');
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          تعديل الشكوى
        </button>
      </div>

      {/* Complaint & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Complaint Details */}
        <div className="border p-4 rounded-lg bg-blue-50">
          <h3 className="text-xl font-semibold mb-3 text-blue-800">بيانات الشكوى</h3>
          <p><span className="font-medium">رقم الشكوى:</span> {complaint.id}</p>
          <p><span className="font-medium">تاريخ ورود الشكوى:</span> {new Date(complaint.dateReceived).toLocaleDateString('ar-EG')}</p>
          <p><span className="font-medium">تصنيف المشكلة:</span> {complaint.category}</p>
          <p><span className="font-medium">وصف المشكلة:</span> {complaint.description}</p>
          <p><span className="font-medium">الإجراء المتخذ:</span> {complaint.actionTaken || 'لم يتم تسجيل إجراء'}</p>
          <p><span className="font-medium">تاريخ الانتهاء:</span> {complaint.resolutionDate ? new Date(complaint.resolutionDate).toLocaleDateString('ar-EG') : 'لم تنتهِ بعد'}</p>
        </div>

        {/* Customer Details */}
        {customer && (
          <div className="border p-4 rounded-lg bg-green-50">
            <h3 className="text-xl font-semibold mb-3 text-green-800">بيانات العميل</h3>
            <p><span className="font-medium">رقم المشترك:</span> {customer.subscriberId}</p>
            <p><span className="font-medium">اسم العميل:</span> {customer.name}</p>
            <p><span className="font-medium">عنوان العميل:</span> {customer.address || 'غير متوفر'}</p>
            <p><span className="font-medium">رقم الهاتف:</span> {customer.phoneNumber || 'غير متوفر'}</p>
            <p><span className="font-medium">آخر قراءة بالعداد:</span> {customer.lastMeterReading || 'غير متوفر'}</p>
            <p><span className="font-medium">تاريخ آخر قراءة:</span> {customer.lastReadingDate ? new Date(customer.lastReadingDate).toLocaleDateString('ar-EG') : 'غير متوفر'}</p>
            <p><span className="font-medium">المديونية:</span> {customer.outstandingBalance ? `${customer.outstandingBalance} جنيه` : 'غير متوفر'}</p>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="mt-6 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">المرفقات</h3>
          <button
            onClick={() => setShowAddAttachmentModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            إضافة مرفق جديد
          </button>
        </div>
        
        {attachments.length === 0 ? (
          <p className="text-gray-500">لا توجد مرفقات لهذه الشكوى.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map(att => (
              <div key={att.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-2">
                  {att.type.startsWith('image/') ? (
                    <img src={att.base64Content} alt={att.name} className="max-h-32 mx-auto" />
                  ) : (
                    <div className="text-6xl text-gray-400">📄</div>
                  )}
                </div>
                <p className="font-medium text-center mb-2">{att.name}</p>
                <div className="flex justify-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleDownloadAttachment(att.base64Content, att.name)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    تنزيل
                  </button>
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Correspondence Section */}
      <div className="mt-6 border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">المراسلات</h3>
          <button
            onClick={() => setShowAddCorrespondenceModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            إضافة مراسلة جديدة
          </button>
        </div>

        {correspondence.length === 0 ? (
          <p className="text-gray-500">لا توجد مراسلات لهذه الشكوى.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموضوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {correspondence.map(corr => (
                  <tr key={corr.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{corr.type}</td>
                    <td className="px-6 py-4">{corr.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(corr.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteCorrespondence(corr.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Section */}
      <div className="mt-6 border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">سجل التعديلات</h3>
        {auditLog.length === 0 ? (
          <p className="text-gray-500">لا توجد سجلات تعديل لهذه الشكوى.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddAttachmentModal && (
        <AddAttachmentModal
          complaintId={complaint.id}
          onClose={() => setShowAddAttachmentModal(false)}
          onSuccess={(message) => {
            setMessage(message);
            setMessageType('success');
            setAttachments(localStorageService.getAttachments(complaint.id));
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}

      {showAddCorrespondenceModal && (
        <AddCorrespondenceModal
          complaintId={complaint.id}
          onClose={() => setShowAddCorrespondenceModal(false)}
          onSuccess={(message) => {
            setMessage(message);
            setMessageType('success');
            setCorrespondence(localStorageService.getCorrespondence(complaint.id));
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}