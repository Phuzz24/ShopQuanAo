import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { Save, Sun, Moon, Info, Type, Languages, Music, Table2 } from "lucide-react";
import { ChromePicker } from "react-color";
import toast from "react-hot-toast";

// Component xem trước giao diện
const PreviewCard = ({ theme, primaryColor, fontSize }) => {
  const isDark = theme === "dark";
  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
        isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
      style={{ border: `2px solid ${primaryColor}` }}
    >
      <h3 className="font-semibold mb-2">Xem trước giao diện</h3>
      <p className="text-sm mb-2">Đây là giao diện mẫu với theme, màu sắc và kích thước chữ đã chọn:</p>
      <div className="space-y-2">
        <Button
          className="w-full"
          style={{ backgroundColor: primaryColor, color: isDark ? "#fff" : "#000" }}
        >
          Nút mẫu
        </Button>
        <div
          className={`p-2 rounded ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
          style={{ color: isDark ? "#fff" : "#000" }}
        >
          Card mẫu
        </div>
        <p
          className={`text-sm ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-lg" : "text-base"}`}
          style={{ color: primaryColor }}
        >
          Văn bản mẫu với màu chủ đạo
        </p>
      </div>
    </div>
  );
};

const Settings = () => {
  // State cho cài đặt
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      theme: "light",
      primaryColor: "#4F46E5",
      fontSize: "medium",
      language: "vi",
      transitionEffects: true,
      transitionSpeed: "medium",
      emailNotifications: true,
      systemNotifications: true,
      notificationSound: true,
      notificationSoundType: "default",
      notificationSchedule: "daily",
      rowsPerPage: 10,
    };

    try {
      const savedSettings = localStorage.getItem("adminSettings");
      if (!savedSettings) return defaultSettings;
      const parsedSettings = JSON.parse(savedSettings);
      return { ...defaultSettings, ...parsedSettings };
    } catch (error) {
      console.error("Error parsing adminSettings from localStorage:", error);
      return defaultSettings;
    }
  });

  // State để hiển thị color picker
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Lưu cài đặt vào localStorage khi settings thay đổi
  useEffect(() => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    // Áp dụng kích thước chữ vào toàn bộ ứng dụng
    document.documentElement.classList.remove("text-xs", "text-base", "text-lg");
    document.documentElement.classList.add(
      settings.fontSize === "small" ? "text-xs" : settings.fontSize === "large" ? "text-lg" : "text-base"
    );
    // Áp dụng ngôn ngữ (giả lập)
    console.log("Ngôn ngữ đã chọn:", settings.language);
    // Áp dụng hiệu ứng chuyển đổi
    document.documentElement.classList.toggle("no-transitions", !settings.transitionEffects);
    document.documentElement.style.setProperty(
      "--transition-speed",
      settings.transitionSpeed === "fast" ? "0.2s" : settings.transitionSpeed === "slow" ? "0.5s" : "0.3s"
    );
  }, [settings]);

  // Xử lý thay đổi theme
  const handleThemeChange = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  // Xử lý thay đổi màu sắc
  const handleColorChange = (color) => {
    setSettings((prev) => ({ ...prev, primaryColor: color.hex }));
  };

  // Xử lý thay đổi kích thước chữ
  const handleFontSizeChange = (value) => {
    setSettings((prev) => ({ ...prev, fontSize: value }));
  };

  // Xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (value) => {
    setSettings((prev) => ({ ...prev, language: value }));
  };

  // Xử lý bật/tắt hiệu ứng chuyển đổi
  const handleTransitionEffectsToggle = () => {
    setSettings((prev) => ({ ...prev, transitionEffects: !prev.transitionEffects }));
  };

  // Xử lý thay đổi tốc độ hiệu ứng
  const handleTransitionSpeedChange = (value) => {
    setSettings((prev) => ({ ...prev, transitionSpeed: value }));
  };

  // Xử lý bật/tắt thông báo
  const handleNotificationToggle = (type) => {
    setSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Xử lý bật/tắt âm thanh thông báo
  const handleNotificationSoundToggle = () => {
    setSettings((prev) => ({ ...prev, notificationSound: !prev.notificationSound }));
  };

  // Xử lý thay đổi loại âm thanh
  const handleNotificationSoundTypeChange = (value) => {
    setSettings((prev) => ({ ...prev, notificationSoundType: value }));
  };

  // Xử lý thay đổi lịch thông báo
  const handleScheduleChange = (value) => {
    setSettings((prev) => ({ ...prev, notificationSchedule: value }));
  };

  // Xử lý thay đổi số dòng trên bảng
  const handleRowsPerPageChange = (value) => {
    setSettings((prev) => ({ ...prev, rowsPerPage: parseInt(value) }));
  };

  // Lưu cài đặt
  const handleSaveSettings = () => {
    toast.success("Cập nhật cài đặt thành công!", {
      style: {
        background: settings.theme === "dark" ? "#333" : "#fff",
        color: settings.theme === "dark" ? "#fff" : "#000",
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-gray-500 dark:text-gray-400">Quản lý cài đặt và tùy chỉnh hệ thống</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-3 w-[450px] bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <TabsTrigger
            value="appearance"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Giao diện
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Thông báo
          </TabsTrigger>
          <TabsTrigger
            value="display"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Hiển thị
          </TabsTrigger>
        </TabsList>

        {/* Tab Giao diện */}
        <TabsContent value="appearance" className="mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Cài đặt giao diện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chọn theme */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Chọn theme</Label>
                <div className="flex gap-4">
                  <Button
                    variant={settings.theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  >
                    <Sun className="h-4 w-4" /> Sáng
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  >
                    <Moon className="h-4 w-4" /> Tối
                  </Button>
                </div>
              </div>

              {/* Chọn màu chủ đạo */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Màu chủ đạo</Label>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{ backgroundColor: settings.primaryColor }}
                    className="h-10 w-10 rounded-full shadow-md transition-transform duration-200 hover:scale-110"
                  />
                  <span className="text-sm font-mono">{settings.primaryColor}</span>
                </div>
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <ChromePicker
                      color={settings.primaryColor}
                      onChangeComplete={handleColorChange}
                    />
                  </div>
                )}
              </div>

              {/* Chọn kích thước chữ */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Kích thước chữ</Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={handleFontSizeChange}
                >
                  <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Chọn kích thước" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Nhỏ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="large">Lớn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chọn ngôn ngữ */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Ngôn ngữ</Label>
                <Select
                  value={settings.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">Tiếng Anh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bật/tắt hiệu ứng chuyển đổi */}
              <TooltipProvider>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Hiệu ứng chuyển đổi</Label>
                    <Tooltip>
                      {({ isOpen, setIsOpen }) => (
                        <>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 text-gray-500" />
                            </span>
                          </TooltipTrigger>
                          {isOpen && (
                            <TooltipContent>
                              Bật/tắt các hiệu ứng chuyển đổi trong giao diện
                            </TooltipContent>
                          )}
                        </>
                      )}
                    </Tooltip>
                  </div>
                  <Switch
                    checked={settings.transitionEffects}
                    onCheckedChange={handleTransitionEffectsToggle}
                    className="data-[state=checked]:bg-admin"
                  />
                </div>

                {/* Chọn tốc độ hiệu ứng */}
                {settings.transitionEffects && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Tốc độ hiệu ứng</Label>
                    <Select
                      value={settings.transitionSpeed}
                      onValueChange={handleTransitionSpeedChange}
                    >
                      <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Chọn tốc độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Nhanh</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="slow">Chậm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TooltipProvider>

              {/* Xem trước giao diện */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Xem trước</Label>
                <PreviewCard
                  theme={settings.theme}
                  primaryColor={settings.primaryColor}
                  fontSize={settings.fontSize}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  className="bg-admin hover:bg-admin-secondary transition-all duration-200 hover:scale-105"
                  onClick={handleSaveSettings}
                >
                  <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Thông báo */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Cài đặt thông báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bật/tắt thông báo email */}
              <TooltipProvider>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Thông báo qua email</Label>
                    <Tooltip>
                      {({ isOpen, setIsOpen }) => (
                        <>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 text-gray-500" />
                            </span>
                          </TooltipTrigger>
                          {isOpen && (
                            <TooltipContent>
                              Gửi thông báo qua email khi có sự kiện quan trọng (ví dụ: đơn hàng mới)
                            </TooltipContent>
                          )}
                        </>
                      )}
                    </Tooltip>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                    className="data-[state=checked]:bg-admin"
                  />
                </div>

                {/* Bật/tắt thông báo trên hệ thống */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Thông báo trên hệ thống</Label>
                    <Tooltip>
                      {({ isOpen, setIsOpen }) => (
                        <>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 text-gray-500" />
                            </span>
                          </TooltipTrigger>
                          {isOpen && (
                            <TooltipContent>
                              Hiển thị thông báo trong ứng dụng
                            </TooltipContent>
                          )}
                        </>
                      )}
                    </Tooltip>
                  </div>
                  <Switch
                    checked={settings.systemNotifications}
                    onCheckedChange={() => handleNotificationToggle("systemNotifications")}
                    className="data-[state=checked]:bg-admin"
                  />
                </div>

                {/* Bật/tắt âm thanh thông báo */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Âm thanh thông báo</Label>
                    <Tooltip>
                      {({ isOpen, setIsOpen }) => (
                        <>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 text-gray-500" />
                            </span>
                          </TooltipTrigger>
                          {isOpen && (
                            <TooltipContent>
                              Phát âm thanh khi có thông báo mới
                            </TooltipContent>
                          )}
                        </>
                      )}
                    </Tooltip>
                  </div>
                  <Switch
                    checked={settings.notificationSound}
                    onCheckedChange={handleNotificationSoundToggle}
                    className="data-[state=checked]:bg-admin"
                  />
                </div>

                {/* Chọn loại âm thanh */}
                {settings.notificationSound && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Loại âm thanh</Label>
                    <Select
                      value={settings.notificationSoundType}
                      onValueChange={handleNotificationSoundTypeChange}
                    >
                      <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Chọn âm thanh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Mặc định</SelectItem>
                        <SelectItem value="bell">Chuông</SelectItem>
                        <SelectItem value="chime">Tiếng vang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Cài đặt lịch gửi thông báo */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Lịch gửi thông báo</Label>
                  <Select
                    value={settings.notificationSchedule}
                    onValueChange={handleScheduleChange}
                  >
                    <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Chọn lịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipProvider>

              <div className="flex justify-end mt-6">
                <Button
                  className="bg-admin hover:bg-admin-secondary transition-all duration-200 hover:scale-105"
                  onClick={handleSaveSettings}
                >
                  <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Hiển thị */}
        <TabsContent value="display" className="mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Cài đặt hiển thị</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cài đặt số dòng trên bảng */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Số dòng trên bảng</Label>
                <Select
                  value={settings.rowsPerPage ? settings.rowsPerPage.toString() : "10"}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="w-[200px] border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Chọn số dòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 dòng</SelectItem>
                    <SelectItem value="20">20 dòng</SelectItem>
                    <SelectItem value="50">50 dòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  className="bg-admin hover:bg-admin-secondary transition-all duration-200 hover:scale-105"
                  onClick={handleSaveSettings}
                >
                  <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;