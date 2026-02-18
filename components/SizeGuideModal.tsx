'use client';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'Sneakers' }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const sizeGuides: Record<string, any> = {
    'Sneakers': {
      measurements: ['UK', 'EU', 'US Men', 'US Women', 'CM'],
      sizes: [
        { size: '37', uk: '4', eu: '37', 'us men': '5', 'us women': '6.5', cm: '23' },
        { size: '38', uk: '5', eu: '38', 'us men': '6', 'us women': '7.5', cm: '24' },
        { size: '39', uk: '6', eu: '39', 'us men': '7', 'us women': '8.5', cm: '24.5' },
        { size: '40', uk: '6.5', eu: '40', 'us men': '7.5', 'us women': '9', cm: '25' },
        { size: '41', uk: '7', eu: '41', 'us men': '8', 'us women': '9.5', cm: '26' },
        { size: '42', uk: '8', eu: '42', 'us men': '9', 'us women': '10.5', cm: '26.5' },
        { size: '43', uk: '9', eu: '43', 'us men': '10', 'us women': '11.5', cm: '27.5' },
        { size: '44', uk: '10', eu: '44', 'us men': '11', 'us women': '12.5', cm: '28' },
        { size: '45', uk: '11', eu: '45', 'us men': '12', 'us women': '13.5', cm: '29' },
      ]
    }
  };

  const guide = sizeGuides[category] || sizeGuides['Sneakers'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-4xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Size Guide - {category}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-2xl text-gray-700"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="w-6 h-6 flex items-center justify-center mr-3">
                  <i className="ri-information-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">How to Find Your Size</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Stand on a piece of paper and trace your foot</li>
                    <li>• Measure from heel to longest toe in centimetres</li>
                    <li>• Match your measurement to the CM column below</li>
                    <li>• If between sizes, we recommend going half a size up</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                    {guide.measurements.map((measurement: string) => (
                      <th key={measurement} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.sizes.map((row: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                      {guide.measurements.map((measurement: string) => {
                        const key = measurement.toLowerCase();
                        return (
                          <td key={measurement} className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                            {row[key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <i className="ri-ruler-line text-emerald-700"></i>
                  </div>
                  Sizing Tips
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>Foot length:</strong> Measure in the afternoon when feet are slightly larger</li>
                  <li>• <strong>Width:</strong> Some brands run narrow — check product descriptions</li>
                  <li>• <strong>Socks:</strong> Wear the socks you plan to use when measuring</li>
                  <li>• <strong>Both feet:</strong> Measure both and use the larger measurement</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <i className="ri-question-line text-emerald-700"></i>
                  </div>
                  Fit Guide
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Between sizes? Size up for comfort</li>
                  <li>• Check product description for fit notes</li>
                  <li>• Read customer reviews for insights</li>
                  <li>• Contact support for personalized help</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Still not sure about sizing? Our customer service team is here to help!
              </p>
              <button className="px-6 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
