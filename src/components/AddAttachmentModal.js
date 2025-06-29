function AddAttachmentModal({ complaintId, onClose, onSuccess }) {
  const { localStorageService } = useContext(AppContext);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentDescription, setAttachmentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attachmentName || !selectedFile) {
      setError('الرجاء إدخال اسم المرفق واختيار ملف');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment = {
          complaintId,
          name: attachmentName,
          description: attachmentDescription,
          type: selectedFile.type,
          base64Content: reader.result,
          dateAdded: new Date().toISOString()
        };

        localStorageService.addAttachment(attachment);
        localStorageService.addAuditLog({
          entityType: 'attachment',
          entityId: complaintId,
          details: `تم إضافة مرفق جديد: ${attachmentName}`
        });

        onSuccess('تم إضافة المرفق بنجاح');
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setError('حدث خطأ أثناء إضافة المرفق');
      console.error('Error adding attachment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">إضافة مرفق جديد</h3>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              اسم المرفق:
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              وصف المرفق:
            </label>
            <textarea
              value={attachmentDescription}
              onChange={(e) => setAttachmentDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              الملف:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full"
              accept="image/*,.pdf"
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