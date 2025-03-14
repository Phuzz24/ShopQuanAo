import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useState } from "react";
import { Save } from "lucide-react";

const Settings = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: "Phone Store Admin",
    email: "admin@phonestore.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM"
  });

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-gray-500 dark:text-gray-400">Quản lý cài đặt và tùy chỉnh hệ thống</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="store">Thông tin cửa hàng</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cửa hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Tên cửa hàng</Label>
                  <Input 
                    id="storeName" 
                    name="name" 
                    value={storeInfo.name} 
                    onChange={handleStoreInfoChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email</Label>
                  <Input 
                    id="storeEmail" 
                    name="email" 
                    type="email" 
                    value={storeInfo.email} 
                    onChange={handleStoreInfoChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Số điện thoại</Label>
                  <Input 
                    id="storePhone" 
                    name="phone" 
                    value={storeInfo.phone} 
                    onChange={handleStoreInfoChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Địa chỉ</Label>
                  <Input 
                    id="storeAddress" 
                    name="address" 
                    value={storeInfo.address} 
                    onChange={handleStoreInfoChange} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button className="bg-admin hover:bg-admin-secondary">
                  <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt giao diện</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Tùy chỉnh giao diện người dùng sẽ được cập nhật trong phiên bản tới.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Tùy chỉnh thông báo sẽ được cập nhật trong phiên bản tới.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
