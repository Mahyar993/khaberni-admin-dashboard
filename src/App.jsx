import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "https://khaberni-backend.onrender.com";

const DEFAULT_SECTIONS = [
  { id: "Water", title: "مياه اليوم" },
  { id: "Pharmacy", title: "الصيدليات المناوبة" },
  { id: "fuel", title: "المحروقات" },
  { id: "currencies", title: "أسعار العملات" },
];
const ICON_OPTIONS = [
  "info",
  "home",
  "star",
  "notification",
  "taxi",
  "pharmacy",
  "water",
  "money",
  "fuel",
  "ads",
  "electric",
  "restaurant",
  "hospital",
  "phone",
];

const COLOR_OPTIONS = [
  "blue",
  "green",
  "orange",
  "red",
  "purple",
  "black",
  "white",
  "gray",
  "yellow",
  "pink",
  "cyan",
  "teal",
  "brown",
  "lime",
  "indigo",
];
function App() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);

  const [selectedSection, setSelectedSection] = useState("Water");
  const [items, setItems] = useState([]);
const [schedulerConfig, setSchedulerConfig] = useState({
  dailySheetHour: 6,
  dailySheetMinute: 0,
  waterNotificationHour: 9,
  waterNotificationMinute: 0,
  currencyIntervalMinutes: 90,
  currencyStartHour: 6,
  currencyEndHour: 18,
  isDailySheetEnabled: true,
  isWaterNotificationEnabled: true,
  isCurrencyUpdateEnabled: true,
});
const [ads, setAds] = useState([]);

const [adForm, setAdForm] = useState({
  adId: "",
  title: "",
  description: "",
  imageUrl: "",
  phone: "",
  order: 1,
  isActive: true,
  isFeatured: false,
  imageFile: null,
});
const [sections, setSections] = useState([]);

const [sectionForm, setSectionForm] = useState({
  sectionId: "",
  title: "",
  subtitle: "",
  icon: "info",
  color: "blue",
  order: 1,
  isActive: true,
});
const [appConfig, setAppConfig] = useState({
  isAppEnabled: true,
  maintenanceMessage: "",
  minimumRequiredVersion: 1,
  latestVersion: 1,
  updateMessage: "يرجى تحديث التطبيق إلى آخر نسخة للاستمرار.",
  updateUrl: "",
});
  const [form, setForm] = useState({
    id: "",
    title: "",
    content: "",
    order: 1,
    icon: "",
    color: "",
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        password,
      });

      const adminToken = response.data.token;
      localStorage.setItem("adminToken", adminToken);
      setToken(adminToken);
    } catch (error) {
      setMessage("كلمة المرور غير صحيحة أو حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setPassword("");
  };

  const loadItems = async () => {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/sections/${selectedSection}/items`,
        authHeaders
      );

      setItems(response.data.items || []);
    } catch (error) {
      setMessage("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulerConfig = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/scheduler-config`,
        authHeaders
      );

      setSchedulerConfig(response.data.config);
    } catch (error) {
      setMessage("فشل تحميل إعدادات الجدولة");
    } finally {
      setLoading(false);
    }
  };

 const saveSchedulerConfig = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    await axios.post(
      `${API_BASE_URL}/api/admin/scheduler-config`,
      schedulerConfig,
      authHeaders
    );

    setMessage("تم حفظ إعدادات الجدولة بنجاح");
  } catch (error) {
    setMessage("فشل حفظ إعدادات الجدولة");
  } finally {
    setLoading(false);
  }

  };
  useEffect(() => {
    if (token && activePage === "sections") {
      loadSections();
    }
  }, [token, activePage]);
  useEffect(() => {
    if (token && activePage === "ads") {
      loadAds();
    }
  }, [token, activePage]);
  useEffect(() => {
    if (token && activePage === "stats") {
      loadStats();
    }
  }, [token, activePage]);
  useEffect(() => {
    if (token && activePage === "appSecurity") {
      loadAppConfig();
    }
  }, [token, activePage]);
useEffect(() => {
  if (token && activePage === "scheduler") {
    loadSchedulerConfig();
  }
}, [token, activePage]);

  useEffect(() => {
    if (token && activePage === "content") {
      loadItems();
    }
  }, [token, activePage, selectedSection]);

  const resetForm = () => {
    setForm({
      id: "",
      title: "",
      content: "",
      order: 1,
      icon: "",
      color: "",
    });
  };

  const saveItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        title: form.title,
        content: form.content,
        order: Number(form.order) || 999,
        icon: form.icon,
        color: form.color,
      };

      if (form.id) {
        await axios.put(
          `${API_BASE_URL}/api/admin/sections/${selectedSection}/items/${form.id}`,
          payload,
          authHeaders
        );

        setMessage("تم تعديل العنصر بنجاح");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/sections/${selectedSection}/items`,
          payload,
          authHeaders
        );

        setMessage("تمت إضافة العنصر بنجاح");
      }

      resetForm();
      await loadItems();
    } catch (error) {
      setMessage("فشل حفظ العنصر");
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item) => {
    setForm({
      id: item.id || "",
      title: item.title || "",
      content: item.content || "",
      order: item.order || 1,
      icon: item.icon || "",
      color: item.color || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (itemId) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا العنصر؟");

    if (!confirmDelete) return;

    setLoading(true);
    setMessage("");

    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/sections/${selectedSection}/items/${itemId}`,
        authHeaders
      );

      setMessage("تم حذف العنصر بنجاح");
      await loadItems();
    } catch (error) {
      setMessage("فشل حذف العنصر");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API_BASE_URL}/api/notifications/send`,
        {
          title: form.title,
          body: form.content,
        },
        authHeaders
      );

      setMessage("تم إرسال الإشعار بنجاح");
      resetForm();
    } catch (error) {
      setMessage("فشل إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };
const loadStats = async () => {
  setLoading(true);
  setMessage("");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/stats`,
      authHeaders
    );

    setStats(response.data.stats);
  } catch (error) {
    setMessage("فشل تحميل الإحصائيات");
  } finally {
    setLoading(false);
  }
};
const loadAppConfig = async () => {
  setLoading(true);
  setMessage("");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/app-config`);
    setAppConfig(response.data.config);
  } catch (error) {
    setMessage("فشل تحميل إعدادات التطبيق");
  } finally {
    setLoading(false);
  }
};

const saveAppConfig = async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");

  try {
    await axios.post(
      `${API_BASE_URL}/api/admin/app-config`,
      appConfig,
      authHeaders
    );

    setMessage("تم حفظ إعدادات التطبيق بنجاح");
  } catch (error) {
    setMessage("فشل حفظ إعدادات التطبيق");
  } finally {
    setLoading(false);
  }
};
const resetAdForm = () => {
  setAdForm({
    adId: "",
    title: "",
    description: "",
    imageUrl: "",
    phone: "",
    order: 1,
    isActive: true,
    isFeatured: false,
    imageFile: null,
  });
};

const loadAds = async () => {
  setLoading(true);
  setMessage("");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/ads`,
      authHeaders
    );

    setAds(response.data.ads || []);
  } catch (error) {
    setMessage("فشل تحميل الإعلانات");
  } finally {
    setLoading(false);
  }
};

const uploadAdImage = async () => {
  if (!adForm.imageFile) {
    return adForm.imageUrl;
  }

  const formData = new FormData();
  formData.append("image", adForm.imageFile);

  const response = await axios.post(
    `${API_BASE_URL}/api/upload-image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.imageUrl;
};

const saveAd = async (e) => {
  e.preventDefault();

  if (!adForm.adId || !adForm.title || !adForm.order) {
    setMessage("يرجى تعبئة معرّف الإعلان والعنوان والترتيب");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const finalImageUrl = await uploadAdImage();

    const payload = {
      title: adForm.title,
      description: adForm.description,
      imageUrl: finalImageUrl || "",
      phone: adForm.phone,
      order: Number(adForm.order) || 999,
      isActive: adForm.isActive,
      isFeatured: adForm.isFeatured,
    };

    if (ads.some((ad) => ad.id === adForm.adId)) {
      await axios.put(
        `${API_BASE_URL}/api/admin/ads/${adForm.adId}`,
        payload,
        authHeaders
      );

      setMessage("تم تعديل الإعلان بنجاح");
    } else {
      await axios.post(
        `${API_BASE_URL}/api/admin/ads`,
        {
          adId: adForm.adId,
          ...payload,
        },
        authHeaders
      );

      setMessage("تمت إضافة الإعلان بنجاح");
    }

    resetAdForm();
    await loadAds();
  } catch (error) {
    setMessage("فشل حفظ الإعلان");
  } finally {
    setLoading(false);
  }
};

const editAd = (ad) => {
  setAdForm({
    adId: ad.id || "",
    title: ad.title || "",
    description: ad.description || "",
    imageUrl: ad.imageUrl || "",
    phone: ad.phone || "",
    order: ad.order || 1,
    isActive: ad.isActive !== false,
    isFeatured: ad.isFeatured === true,
    imageFile: null,
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const deleteAd = async (adId) => {
  const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا الإعلان؟");

  if (!confirmDelete) return;

  setLoading(true);
  setMessage("");

  try {
    await axios.delete(
      `${API_BASE_URL}/api/admin/ads/${adId}`,
      authHeaders
    );

    setMessage("تم حذف الإعلان بنجاح");
    await loadAds();
  } catch (error) {
    setMessage("فشل حذف الإعلان");
  } finally {
    setLoading(false);
  }
};
const resetSectionForm = () => {
  setSectionForm({
    sectionId: "",
    title: "",
    subtitle: "",
    icon: "info",
    color: "blue",
    order: 1,
    isActive: true,
  });
};

const loadSections = async () => {
  setLoading(true);
  setMessage("");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/sections`,
      authHeaders
    );

    setSections(response.data.sections || []);
  } catch (error) {
    setMessage("فشل تحميل الأقسام الرئيسية");
  } finally {
    setLoading(false);
  }
};

const saveSection = async (e) => {
  e.preventDefault();

  if (!sectionForm.sectionId || !sectionForm.title) {
    setMessage("يرجى تعبئة معرّف القسم والعنوان");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const payload = {
      title: sectionForm.title,
      subtitle: sectionForm.subtitle,
      icon: sectionForm.icon,
      color: sectionForm.color,
      order: Number(sectionForm.order) || 999,
      isActive: sectionForm.isActive,
    };

    if (sections.some((section) => section.id === sectionForm.sectionId)) {
      await axios.put(
        `${API_BASE_URL}/api/admin/sections/${sectionForm.sectionId}`,
        payload,
        authHeaders
      );

      setMessage("تم تعديل القسم بنجاح");
    } else {
      await axios.post(
        `${API_BASE_URL}/api/admin/sections`,
        {
          sectionId: sectionForm.sectionId,
          ...payload,
        },
        authHeaders
      );

      setMessage("تمت إضافة القسم بنجاح");
    }

    resetSectionForm();
    await loadSections();
  } catch (error) {
    setMessage("فشل حفظ القسم");
  } finally {
    setLoading(false);
  }
};

const editSection = (section) => {
  setSectionForm({
    sectionId: section.id || "",
    title: section.title || "",
    subtitle: section.subtitle || "",
    icon: section.icon || "",
    color: section.color || "",
    order: section.order || 1,
    isActive: section.isActive !== false,
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const deleteSection = async (sectionId) => {
  const confirmDelete = window.confirm(
    "هل أنت متأكد من حذف هذا القسم؟ إذا كان يحتوي عناصر فقد لا تظهر في التطبيق."
  );

  if (!confirmDelete) return;

  setLoading(true);
  setMessage("");

  try {
    await axios.delete(
      `${API_BASE_URL}/api/admin/sections/${sectionId}`,
      authHeaders
    );

    setMessage("تم حذف القسم بنجاح");
    await loadSections();
  } catch (error) {
    setMessage("فشل حذف القسم");
  } finally {
    setLoading(false);
  }
};
  const runJob = async (jobName) => {
    setLoading(true);
    setMessage("");

    try {
      await axios.get(`${API_BASE_URL}/api/jobs/${jobName}`, authHeaders);
      setMessage("تم تنفيذ العملية بنجاح");
    } catch (error) {
      setMessage("فشل تنفيذ العملية");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>لوحة تحكم خبرني</h1>
          <p>تسجيل دخول الأدمن</p>

          <form onSubmit={login}>
            <input
              type="password"
              placeholder="كلمة مرور الأدمن"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {message && <div className="message error">{message}</div>}

            <button disabled={loading}>{loading ? "جاري الدخول..." : "دخول"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>خبرني</h2>

        <button onClick={() => setActivePage("home")}>الرئيسية</button>
        <button onClick={() => setActivePage("content")}>إدارة المحتوى</button>
        <button onClick={() => setActivePage("notifications")}>الإشعارات</button>
        <button onClick={() => setActivePage("jobs")}>التحديثات</button>
        <button onClick={() => setActivePage("scheduler")}>إعدادات الجدولة</button>
        <button onClick={() => setActivePage("stats")}>إحصائيات التطبيق</button>
        <button onClick={() => setActivePage("appSecurity")}>أمان التطبيق</button>
        <button onClick={() => setActivePage("ads")}>إدارة الإعلانات</button>
        <button onClick={() => setActivePage("sections")}>إدارة الأقسام الرئيسية</button>

        <button className="logout" onClick={logout}>
          تسجيل خروج
        </button>
      </aside>

      <main className="content">
        {message && <div className="message">{message}</div>}

        {activePage === "home" && (
          <>
            <h1>لوحة التحكم</h1>
            <p>من هنا يمكنك التحكم الكامل بمحتوى تطبيق خبرني.</p>

            <div className="cards">
              <div className="stat-card">
                <h3>إدارة المحتوى</h3>
                <p>إضافة وتعديل المياه والصيدليات والمحروقات والعملات.</p>
              </div>

              <div className="stat-card">
                <h3>الإشعارات</h3>
                <p>إرسال إشعارات فورية لجميع المستخدمين.</p>
              </div>

              <div className="stat-card">
                <h3>التحديثات</h3>
                <p>تشغيل تحديث العملات أو إرسال إشعارات المياه يدويًا.</p>
              </div>
            </div>
          </>
        )}

        {activePage === "content" && (
          <>
            <h1>إدارة المحتوى</h1>

            <div className="toolbar">
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  resetForm();
                }}
              >
                {DEFAULT_SECTIONS.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>

              <button onClick={loadItems}>تحديث القائمة</button>
            </div>

            <form className="form-card" onSubmit={saveItem}>
              <h2>{form.id ? "تعديل عنصر" : "إضافة عنصر جديد"}</h2>

              <input
                placeholder="العنوان"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                placeholder="المحتوى"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />

              <input
                type="number"
                placeholder="الترتيب"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />

              <div className="form-actions">
                <button disabled={loading}>
                  {form.id ? "حفظ التعديل" : "إضافة"}
                </button>

                {form.id && (
                  <button type="button" className="secondary" onClick={resetForm}>
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>

            <div className="items-list">
              {loading && <p>جاري التحميل...</p>}

              {!loading && items.length === 0 && <p>لا توجد عناصر حاليًا.</p>}

              {items.map((item) => (
                <div className="item-card" key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                    <small>
                      ID: {item.id} | Order: {item.order}
                    </small>
                  </div>

                  <div className="item-actions">
                    <button onClick={() => editItem(item)}>تعديل</button>
                    <button className="danger" onClick={() => deleteItem(item.id)}>
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

 {activePage === "sections" && (
      <>
        <h1>إدارة الأقسام الرئيسية</h1>
        <p>إضافة وتعديل وحذف الأقسام التي تظهر في الصفحة الرئيسية للتطبيق.</p>

        <form className="form-card" onSubmit={saveSection}>
          <h2>
            {sections.some((section) => section.id === sectionForm.sectionId)
              ? "تعديل قسم"
              : "إضافة قسم جديد"}
          </h2>

          <input
            placeholder="معرّف القسم بالإنكليزي مثال: Water"
            value={sectionForm.sectionId}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                sectionId: e.target.value,
              })
            }
          />

          <input
            placeholder="عنوان القسم"
            value={sectionForm.title}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                title: e.target.value,
              })
            }
          />

          <input
            placeholder="وصف قصير اختياري"
            value={sectionForm.subtitle}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                subtitle: e.target.value,
              })
            }
          />

          <select
            value={sectionForm.icon}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                icon: e.target.value,
              })
            }
          >
            <option value="">اختر الأيقونة</option>
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>

          <select
            value={sectionForm.color}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                color: e.target.value,
              })
            }
          >
            <option value="">اختر اللون</option>
            {COLOR_OPTIONS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="الترتيب"
            value={sectionForm.order}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                order: e.target.value,
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={sectionForm.isActive}
              onChange={(e) =>
                setSectionForm({
                  ...sectionForm,
                  isActive: e.target.checked,
                })
              }
            />
            تفعيل القسم
          </label>

          <div className="form-actions">
            <button disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ القسم"}
            </button>

            <button type="button" className="secondary" onClick={resetSectionForm}>
              تفريغ الحقول
            </button>
          </div>
        </form>

        <div className="items-list">
          <button onClick={loadSections} disabled={loading}>
            تحديث قائمة الأقسام
          </button>

          {loading && <p>جاري التحميل...</p>}

          {!loading && sections.length === 0 && <p>لا توجد أقسام حاليًا.</p>}

          {sections.map((section) => (
            <div className="item-card" key={section.id}>
              <div>
                <h3>{section.title || section.id}</h3>
                <p>{section.subtitle}</p>
                <small>
                  ID: {section.id} | Order: {section.order} |{" "}
                  {section.isActive !== false ? "مفعل" : "غير مفعل"}
                </small>
              </div>

              <div className="item-actions">
                <button onClick={() => editSection(section)}>تعديل</button>

                <button className="danger" onClick={() => deleteSection(section.id)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
{activePage === "ads" && (
  <>
    <h1>إدارة الإعلانات</h1>
    <p>إضافة، تعديل، حذف، وتفعيل الإعلانات داخل التطبيق.</p>

    <form className="form-card" onSubmit={saveAd}>
      <h2>{ads.some((ad) => ad.id === adForm.adId) ? "تعديل إعلان" : "إضافة إعلان"}</h2>

      <input
        placeholder="معرّف الإعلان بالإنكليزي مثال: ad_1"
        value={adForm.adId}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            adId: e.target.value,
          })
        }
      />

      <input
        placeholder="عنوان الإعلان"
        value={adForm.title}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            title: e.target.value,
          })
        }
      />

      <textarea
        placeholder="وصف الإعلان"
        value={adForm.description}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            description: e.target.value,
          })
        }
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setAdForm({
            ...adForm,
            imageFile: e.target.files[0],
          })
        }
      />

      <input
        placeholder="رابط الصورة اختياري"
        value={adForm.imageUrl}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            imageUrl: e.target.value,
            imageFile: null,
          })
        }
      />

      {adForm.imageUrl && (
        <img
          src={adForm.imageUrl}
          alt="Ad Preview"
          style={{
            width: "100%",
            maxHeight: "220px",
            objectFit: "cover",
            borderRadius: "16px",
            marginBottom: "15px",
          }}
        />
      )}

      <input
        placeholder="رقم الهاتف اختياري"
        value={adForm.phone}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            phone: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="الترتيب"
        value={adForm.order}
        onChange={(e) =>
          setAdForm({
            ...adForm,
            order: e.target.value,
          })
        }
      />

      <label>
        <input
          type="checkbox"
          checked={adForm.isActive}
          onChange={(e) =>
            setAdForm({
              ...adForm,
              isActive: e.target.checked,
            })
          }
        />
        تفعيل الإعلان
      </label>

      <label>
        <input
          type="checkbox"
          checked={adForm.isFeatured}
          onChange={(e) =>
            setAdForm({
              ...adForm,
              isFeatured: e.target.checked,
            })
          }
        />
        إعلان مميز في الأعلى
      </label>

      <div className="form-actions">
        <button disabled={loading}>
          {loading ? "جاري الحفظ..." : "حفظ الإعلان"}
        </button>

        <button type="button" className="secondary" onClick={resetAdForm}>
          تفريغ الحقول
        </button>
      </div>
    </form>

    <div className="items-list">
      <button onClick={loadAds} disabled={loading}>
        تحديث قائمة الإعلانات
      </button>

      {loading && <p>جاري التحميل...</p>}

      {!loading && ads.length === 0 && <p>لا توجد إعلانات حاليًا.</p>}

      {ads.map((ad) => (
        <div className="item-card" key={ad.id}>
          <div>
            <h3>{ad.title}</h3>
            <p>{ad.description}</p>

            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                style={{
                  width: "180px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginTop: "10px",
                }}
              />
            )}

            <small>
              ID: {ad.id} | Order: {ad.order} |{" "}
              {ad.isActive ? "مفعل" : "غير مفعل"} |{" "}
              {ad.isFeatured ? "مميز" : "عادي"}
            </small>
          </div>

          <div className="item-actions">
            <button onClick={() => editAd(ad)}>تعديل</button>

            <button className="danger" onClick={() => deleteAd(ad.id)}>
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  </>
)}
        {activePage === "notifications" && (
          <>
            <h1>إرسال إشعار</h1>

            <form className="form-card" onSubmit={sendNotification}>
              <input
                placeholder="عنوان الإشعار"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                placeholder="نص الإشعار"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />

              <button disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال الآن"}
              </button>
            </form>
          </>
        )}

        {activePage === "jobs" && (
          <>
            <h1>التحديثات اليدوية</h1>
            <p>استخدم هذه الأزرار عند الحاجة فقط.</p>

            <div className="cards">
              <div className="stat-card">
                <h3>تحديث العملات</h3>
                <p>جلب أحدث أسعار العملات من المصدر.</p>
                <button onClick={() => runJob("update-currencies")}>
                  تحديث العملات الآن
                </button>
              </div>

              <div className="stat-card">
                <h3>تحديث Google Sheet</h3>
                <p>مؤقتًا حتى يتم الاستغناء عنه بالكامل.</p>
                <button onClick={() => runJob("update-daily-sheet")}>
                  تحديث البيانات الآن
                </button>
              </div>

              <div className="stat-card">
                <h3>إشعارات المياه</h3>
                <p>إرسال إشعارات المياه الحالية لجميع المستخدمين.</p>
                <button onClick={() => runJob("send-water-notifications")}>
                  إرسال إشعار المياه
                </button>
              </div>
            </div>
          </>
        )}
    {activePage === "stats" && (
      <>
        <h1>إحصائيات التطبيق</h1>
        <p>عرض عدد المستخدمين ومرات فتح التطبيق والإعلانات.</p>

        <button onClick={loadStats} disabled={loading}>
          {loading ? "جاري التحديث..." : "تحديث الإحصائيات"}
        </button>

        {stats && (
          <div className="cards">
            <div className="stat-card">
              <h3>عدد الأجهزة / التحميلات التقريبية</h3>
              <p>{stats.estimatedDownloads}</p>
            </div>

            <div className="stat-card">
              <h3>مرات فتح التطبيق اليوم</h3>
              <p>{stats.appOpensToday}</p>
            </div>

            <div className="stat-card">
              <h3>مرات فتح التطبيق هذا الشهر</h3>
              <p>{stats.appOpensThisMonth}</p>
            </div>

            <div className="stat-card">
              <h3>مرات فتح التطبيق هذه السنة</h3>
              <p>{stats.appOpensThisYear}</p>
            </div>

            <div className="stat-card">
              <h3>عدد الإعلانات</h3>
              <p>{stats.totalAds}</p>
            </div>

            <div className="stat-card">
              <h3>الإعلانات المميزة</h3>
              <p>{stats.featuredAds}</p>
            </div>
          </div>
        )}
      </>
    )}
{activePage === "appSecurity" && (
  <>
    <h1>أمان التطبيق</h1>
    <p>التحكم بحالة التطبيق، وضع الصيانة، وإعدادات التحديث.</p>

    <form className="form-card" onSubmit={saveAppConfig}>
      <label>
        <input
          type="checkbox"
          checked={appConfig.isAppEnabled}
          onChange={(e) =>
            setAppConfig({
              ...appConfig,
              isAppEnabled: e.target.checked,
            })
          }
        />
        التطبيق يعمل
      </label>

      <textarea
        placeholder="رسالة الصيانة"
        value={appConfig.maintenanceMessage}
        onChange={(e) =>
          setAppConfig({
            ...appConfig,
            maintenanceMessage: e.target.value,
          })
        }
      />

      <input
        type="number"
        min="1"
        placeholder="Minimum Required Version"
        value={appConfig.minimumRequiredVersion}
        onChange={(e) =>
          setAppConfig({
            ...appConfig,
            minimumRequiredVersion: Number(e.target.value),
          })
        }
      />

      <input
        type="number"
        min="1"
        placeholder="Latest Version"
        value={appConfig.latestVersion}
        onChange={(e) =>
          setAppConfig({
            ...appConfig,
            latestVersion: Number(e.target.value),
          })
        }
      />

      <textarea
        placeholder="رسالة التحديث"
        value={appConfig.updateMessage}
        onChange={(e) =>
          setAppConfig({
            ...appConfig,
            updateMessage: e.target.value,
          })
        }
      />

      <input
        placeholder="رابط التحديث"
        value={appConfig.updateUrl}
        onChange={(e) =>
          setAppConfig({
            ...appConfig,
            updateUrl: e.target.value,
          })
        }
      />

      <button disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ إعدادات التطبيق"}
      </button>
    </form>
  </>
)}
    {activePage === "scheduler" && (
      <>
        <h1>إعدادات الجدولة</h1>
        <p>تحكم بأوقات تحديث البيانات والإشعارات التلقائية.</p>

        <form className="form-card" onSubmit={saveSchedulerConfig}>
          <h2>Google Sheet</h2>

          <label>
            <input
              type="checkbox"
              checked={schedulerConfig.isDailySheetEnabled}
              onChange={(e) =>
                setSchedulerConfig({
                  ...schedulerConfig,
                  isDailySheetEnabled: e.target.checked,
                })
              }
            />
            تشغيل تحديث Google Sheet تلقائيًا
          </label>

          <input
            type="number"
            min="0"
            max="23"
            placeholder="ساعة قراءة Google Sheet"
            value={schedulerConfig.dailySheetHour}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                dailySheetHour: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            min="0"
            max="59"
            placeholder="دقيقة قراءة Google Sheet"
            value={schedulerConfig.dailySheetMinute}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                dailySheetMinute: Number(e.target.value),
              })
            }
          />

          <hr />

          <h2>إشعارات المياه</h2>

          <label>
            <input
              type="checkbox"
              checked={schedulerConfig.isWaterNotificationEnabled}
              onChange={(e) =>
                setSchedulerConfig({
                  ...schedulerConfig,
                  isWaterNotificationEnabled: e.target.checked,
                })
              }
            />
            تشغيل إشعار المياه تلقائيًا
          </label>

          <input
            type="number"
            min="0"
            max="23"
            placeholder="ساعة إشعار المياه"
            value={schedulerConfig.waterNotificationHour}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                waterNotificationHour: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            min="0"
            max="59"
            placeholder="دقيقة إشعار المياه"
            value={schedulerConfig.waterNotificationMinute}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                waterNotificationMinute: Number(e.target.value),
              })
            }
          />

          <hr />

          <h2>تحديث العملات</h2>

          <label>
            <input
              type="checkbox"
              checked={schedulerConfig.isCurrencyUpdateEnabled}
              onChange={(e) =>
                setSchedulerConfig({
                  ...schedulerConfig,
                  isCurrencyUpdateEnabled: e.target.checked,
                })
              }
            />
            تشغيل تحديث العملات تلقائيًا
          </label>

          <select
            value={schedulerConfig.currencyIntervalMinutes}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                currencyIntervalMinutes: Number(e.target.value),
              })
            }
          >
            <option value={30}>كل 30 دقيقة</option>
            <option value={45}>كل 45 دقيقة</option>
            <option value={60}>كل ساعة</option>
            <option value={90}>كل ساعة ونصف</option>
            <option value={120}>كل ساعتين</option>
          </select>

          <input
            type="number"
            min="0"
            max="23"
            placeholder="ساعة بداية تحديث العملات"
            value={schedulerConfig.currencyStartHour}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                currencyStartHour: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            min="0"
            max="23"
            placeholder="ساعة نهاية تحديث العملات"
            value={schedulerConfig.currencyEndHour}
            onChange={(e) =>
              setSchedulerConfig({
                ...schedulerConfig,
                currencyEndHour: Number(e.target.value),
              })
            }
          />

          <button disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ إعدادات الجدولة"}
          </button>
        </form>
      </>
    )}
      </main>
    </div>
  );
}

export default App;
