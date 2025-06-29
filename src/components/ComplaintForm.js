function ComplaintForm({ setCurrentPage, initialComplaint = null }) {
  const { userId, localStorageService } = useContext(AppContext);
  const [subscriberId, setSubscriberId] = useState(initialComplaint?.subscriberId || '');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastMeterReading, setLastMeterReading] = useState('');
  const [lastReadingDate, setLastReadingDate] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [problemCategory, setProblemCategory] = useState(initialComplaint?.category || '');
  const [problemDescription, setProblemDescription] = useState(initialComplaint?.description || '');
  const [actionTaken, setActionTaken] = useState(initialComplaint?.actionTaken || '');
  const [resolutionDate, setResolutionDate] = useState(
    initialComplaint?.resolutionDate ? new Date(initialComplaint.resolutionDate).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const problemCategories = [
    'عبث بالعداد',
    'توصيلات غير شرعية',
    'خطأ قراءة',
    'مشكلة في الفاتورة',
    'مشكلة في التوصيل',
    'أخرى'
  ];

  // Load customer data when subscriberId changes
  useEffect(() => {
    if (subscriberId) {
      const customers = localStorageService.getCustomers();
      const customer = customers.find(c => c.subscriberId === subscriberId);
      if (customer) {
        setCustomerName(customer.name || '');
        setAddress(customer.address || '');
        setPhoneNumber(customer.phoneNumber || '');
        setLastMeterReading(customer.lastMeterReading?.toString() || '');
        setLastReadingDate(customer.lastReadingDate ? new Date(customer.lastReadingDate).toISOString().split('T')[0] : '');
        setOutstandingBalance(customer.outstandingBalance?.toString() || '');
      } else {
        // Clear customer data if subscriber ID doesn't exist
        setCustomerName('');
        setAddress('');
        setPhoneNumber('');
        setLastMeterReading('');
        setLastReadingDate('');
        setOutstandingBalance('');
      }
    }
  }, [subscriberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!subscriberId || !customerName || !problemCategory || !problemDescription) {
      setMessage('الرجاء ملء جميع الحقول المطلوبة (رقم المشترك، اسم العميل، تصنيف ووصف المشكلة).');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // 1. Add/Update Customer Data
      const customerData = {
        subscriberId,
        name: customerName,
        address,
        phoneNumber,
        lastMeterReading: lastMeterReading ? parseFloat(lastMeterReading) : null,
        lastReadingDate: lastReadingDate ? new Date(lastReadingDate).toISOString() : null,
        outstandingBalance: outstandingBalance ? parseFloat(outstandingBalance) : null,
      };
      localStorageService.addOrUpdateCustomer(customerData);

      // 2. Add/Update Complaint Data
      const complaintData = {
        subscriberId,
        category: problemCategory,
        description: problemDescription,
        actionTaken,
        dateReceived: initialComplaint?.dateReceived || new Date().toISOString(),
        resolutionDate: resolutionDate ? new Date(resolutionDate).toISOString() : null,
      };

      let savedComplaint;
      if (initialComplaint) {
        // Update existing complaint
        savedComplaint = localStorageService.updateComplaint(initialComplaint.id, complaintData);
        setMessage('تم تحديث الشكوى بنجاح!');
      } else {
        // Add new complaint
        savedComplaint = localStorageService.addComplaint(complaintData);
        setMessage('تم إضافة الشكوى بنجاح!');
      }
      setMessageType('success');

      // 3. Add to Audit Log
      localStorageService.addAuditLog({
        entityType: 'complaint',
        entityId: savedComplaint.id,
        details: initialComplaint 
          ? `تم تحديث الشكوى رقم: ${savedComplaint.id}` 
          : `تم إضافة شكوى جديدة برقم: ${savedComplaint.id}`,
        changes: { customerData, complaintData }
      });

      // Reset form if adding new
      if (!initialComplaint) {
        setSubscriberId('');
        setCustomerName('');
        setAddress('');
        setPhoneNumber('');
        setLastMeterReading('');
        setLastReadingDate('');
        setOutstandingBalance('');
        setProblemCategory('');
        setProblemDescription('');
        setActionTaken('');
        setResolutionDate('');
      }

    } catch (error) {
      console.error("Error saving complaint:", error);
      setMessage(`خطأ في حفظ الشكوى: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
        {initialComplaint ? 'تعديل الشكوى' : 'إضافة شكوى جديدة'}
      </h2>
      {message && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">
          <h3 className="col-span-full text-xl font-semibold mb-2 text-gray-700">بيانات العميل</h3>
          <div>
            <label htmlFor="subscriberId" className="block text-gray-700 text-sm font-bold mb-2">رقم المشترك:</label>
            <input
              type="text"
              id="subscriberId"
              value={subscriberId}
              onChange={(e) => setSubscriberId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="مثال: 01091818010100"
              required
              disabled={!!initialComplaint}
            />
          </div>
          {/* Rest of the form fields remain the same as in your original code */}
          {/* Just ensure that the onChange handlers update the local state variables */}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-start space-x-4 space-x-reverse">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105 shadow-md"
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : (initialComplaint ? 'حفظ التعديلات' : 'إضافة الشكوى')}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105 shadow-md"
            disabled={loading}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}