function Dashboard({ setCurrentPage, setSelectedComplaint }) {
  const { localStorageService } = useContext(AppContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const problemCategories = [
    'عبث بالعداد',
    'توصيلات غير شرعية',
    'خطأ قراءة',
    'مشكلة في الفاتورة',
    'مشكلة في التوصيل',
    'أخرى'
  ];

  useEffect(() => {
    setLoading(true);
    try {
      // Get complaints and customers
      const allComplaints = localStorageService.getComplaints();
      const allCustomers = localStorageService.getCustomers();

      // Combine complaint data with customer names
      const complaintData = allComplaints.map(complaint => {
        const customer = allCustomers.find(c => c.subscriberId === complaint.subscriberId);
        return {
          ...complaint,
          customerName: customer ? customer.name : 'غير معروف'
        };
      });

      // Sort by date received descending
      complaintData.sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));
      setComplaints(complaintData);
    } catch (err) {
      console.error("Error loading complaints:", err);
      setError("فشل تحميل الشكاوى. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setCurrentPage('viewComplaint');
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = searchTerm === '' ||
      complaint.subscriberId.includes(searchTerm) ||
      complaint.customerName.includes(searchTerm) ||
      complaint.description.includes(searchTerm) ||
      complaint.category.includes(searchTerm);

    const complaintYear = new Date(complaint.dateReceived).getFullYear().toString();
    const matchesYear = filterYear === '' || complaintYear === filterYear;

    const matchesCategory = filterCategory === '' || complaint.category === filterCategory;

    return matchesSearch && matchesYear && matchesCategory;
  });

  const availableYears = [...new Set(complaints.map(c => 
    new Date(c.dateReceived).getFullYear().toString()
  ))].sort((a, b) => b - a);

  if (loading) return <div className="text-center py-8 text-gray-600">جاري تحميل الشكاوى...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">قائمة الشكاوى</h2>
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={() => {
              setSelectedComplaint(null);
              setCurrentPage('addComplaint');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            إضافة شكوى جديدة
          </button>
          <button
            onClick={() => {
              const dataStr = localStorageService.exportData();
              const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataUri);
              downloadAnchor.setAttribute('download', `complaints-backup-${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              document.body.removeChild(downloadAnchor);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            تصدير البيانات
          </button>
          <label className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 cursor-pointer">
            استيراد البيانات
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (localStorageService.importData(event.target.result)) {
                      window.location.reload();
                    } else {
                      alert('حدث خطأ أثناء استيراد البيانات');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">
            بحث (الرقم، الاسم، الوصف، التصنيف):
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="ادخل كلمة للبحث..."
          />
        </div>
        <div>
          <label htmlFor="filterYear" className="block text-gray-700 text-sm font-bold mb-2">
            تصفية حسب السنة:
          </label>
          <select
            id="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">كل السنوات</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-bold mb-2">
            تصفية حسب التصنيف:
          </label>
          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">كل التصنيفات</option>
            {problemCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <p className="text-center text-gray-500 py-8">لا توجد شكاوى مطابقة لمعايير البحث/التصفية.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الشكوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم المشترك
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تصنيف المشكلة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الشكوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.subscriberId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.dateReceived).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => handleViewComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded-md transition duration-200"
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}