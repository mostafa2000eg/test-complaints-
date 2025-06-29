function AddCorrespondenceModal({ complaintId, onClose, onSuccess }) {
  const { localStorageService } = useContext(AppContext);
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !subject || !content) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const correspondence = {
        complaintId,
        type,
        subject,
        text: content,
        date: new Date().toISOString()
      };

      localStorageService.addCorrespondence(correspondence);
      localStorageService.addAuditLog({
        entityType: 'correspondence',
        entityId: complaintId,
        details: `تم إضافة مراسلة جديدة: ${subject}`
      });

      onSuccess('تم إضافة المراسلة بنجاح');
      onClose();
    } catch (error) {
      setError('حدث خطأ أثناء إضافة المراسلة');
      console.error('Error adding correspondence:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">إضافة مراسلة جديدة</h3>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              نوع المراسلة:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3"
              required
            >
              <option value="">اختر النوع</option>
              <option value="صادر">صادر</option>
              <option value="وارد">وارد</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              الموضوع:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              المحتوى:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3"
              rows="4"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}