import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useApiRequest } from "@/Components/Util/useApiRequest";

const STATIC_LOGO_URL = "https://via.placeholder.com/150"; // Static logo value

const Company = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { apiRequest } = useApiRequest();

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading logo:", file);
    }
  };

  async function fetchCompanyDetails() {
    try {
      const response = await apiRequest("/api/company");
      console.log(response);
      setCompanyInfo({
        ...response.data,
        logo: STATIC_LOGO_URL,
        city: response.data.address[1],
        country: response.data.address[3],
        state: response.data.address[2],
        zip: response.data.address[4],
        address: response.data.address[0],
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handleCompanyInfoChange = (name, value) => {
    setCompanyInfo((company) => ({ ...company, [name]: value }));
  };

  const handleUpdateCompany = async () => {
    const { city, country, state, zip, address, ...company } = companyInfo;
    const formatted = {
      ...company,
      address: [address, city, state, country, zip],
    };
    try {
      setLoading(true);
      await apiRequest("/api/company", "PUT", formatted);
      await fetchCompanyDetails();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <p>Loading company details...</p>;
  if (!companyInfo) return <p>Error fetching company data.</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-6">
          <div>
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="mt-2">
              <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Upload size={16} className="mr-2" />
                Change Logo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) =>
                  handleCompanyInfoChange("name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) =>
                    handleCompanyInfoChange("email", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  phone Number
                </label>
                <input
                  type="tel"
                  value={companyInfo.phoneNumber}
                  onChange={(e) =>
                    handleCompanyInfoChange("phoneNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Line
                </label>
                <input
                  type="email"
                  value={companyInfo.tagline}
                  onChange={(e) =>
                    handleCompanyInfoChange("tagline", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UIP Id
                </label>
                <input
                  type="tel"
                  value={companyInfo.upiId}
                  onChange={(e) =>
                    handleCompanyInfoChange("upiId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) =>
                  handleCompanyInfoChange("address", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={companyInfo.city}
                onChange={(e) =>
                  handleCompanyInfoChange("city", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={companyInfo.state}
                onChange={(e) =>
                  handleCompanyInfoChange("state", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={companyInfo.zip}
                onChange={(e) => handleCompanyInfoChange("zip", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={companyInfo.country}
                onChange={(e) =>
                  handleCompanyInfoChange("country", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={companyInfo.website}
                onChange={(e) =>
                  handleCompanyInfoChange("website", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleUpdateCompany}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Company;
