import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import { motion } from "framer-motion";

export default function ReserveTable() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    reservation_date: "",
    reservation_time: "",
    number_of_guests: 2,
    table_type: "regular",
    special_requests: "",
    terms_accepted: false
  });

  const tableTypes = {
    regular: { name: "שולחן רגיל", price: 200, desc: "שולחן נוח למשפחה או חברים" },
    vip: { name: "שולחן VIP", price: 500, desc: "שולחן מרווח עם שירות מיוחד" },
    bar: { name: "שולחן בר", price: 150, desc: "מקום ליד הבר, אווירה מיוחדת" }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.terms_accepted) {
      alert("נא לאשר את התקנון");
      return;
    }

    try {
      const price = tableTypes[formData.table_type].price;
      
      await base44.entities.TableReservation.create({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || "",
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        number_of_guests: formData.number_of_guests,
        table_type: formData.table_type,
        special_requests: formData.special_requests || "",
        terms_accepted: formData.terms_accepted,
        price,
        status: "pending"
      });

      // Send WhatsApp message to owner
      const tableTypeName = tableTypes[formData.table_type].name;
      const whatsappMessage = `🎉 *הזמנה חדשה - מועדון אפריון*

📋 *פרטי ההזמנה:*
━━━━━━━━━━━━━━━━
👤 *שם:* ${formData.customer_name}
📞 *טלפון:* ${formData.customer_phone}
${formData.customer_email ? `📧 *אימייל:* ${formData.customer_email}\n` : ''}
━━━━━━━━━━━━━━━━
📅 *תאריך:* ${formData.reservation_date}
🕐 *שעה:* ${formData.reservation_time}
👥 *מספר אורחים:* ${formData.number_of_guests}
🪑 *סוג שולחן:* ${tableTypeName}
💰 *מחיר:* ₪${price}
${formData.special_requests ? `\n💬 *בקשות מיוחדות:*\n${formData.special_requests}` : ''}

━━━━━━━━━━━━━━━━
⏰ התקבל ב: ${new Date().toLocaleString('he-IL')}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/972507114999?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      setStep(4); // Success step
    } catch (err) {
      console.error("Error creating reservation:", err);
      alert("שגיאה בשמירת ההזמנה, נסה שוב");
    }
  };

  const getTotalPrice = () => {
    return tableTypes[formData.table_type].price;
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)",
      color: "#f9fafb",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Back Button */}
        <Link
          to={createPageUrl("Landing")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#00caff",
            fontSize: "1rem",
            fontWeight: "600",
            marginBottom: "30px",
            textDecoration: "none"
          }}
        >
          <ArrowRight className="w-5 h-5" />
          חזרה לדף הבית
        </Link>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        {step < 4 && (
          <>
            {/* Progress Bar */}
            <div style={{
              display: "flex",
              gap: "10px",
              marginBottom: "40px",
              justifyContent: "center"
            }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    width: "60px",
                    height: "6px",
                    borderRadius: "3px",
                    background: step >= s 
                      ? "linear-gradient(135deg, #00caff, #0088ff)" 
                      : "rgba(255, 255, 255, 0.2)"
                  }}
                />
              ))}
            </div>

            {/* Form Container */}
            <div style={{
              background: "rgba(15, 23, 42, 0.95)",
              borderRadius: "24px",
              padding: "40px",
              border: "1px solid rgba(0, 202, 255, 0.2)",
              boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2)"
            }}>
              <h1 style={{
                fontSize: "2rem",
                fontWeight: "900",
                color: "#00caff",
                textAlign: "center",
                marginBottom: "30px",
                textShadow: "0 0 20px rgba(0, 202, 255, 0.5)"
              }}>
                {step === 1 && "📅 תאריך ושעה"}
                {step === 2 && "👥 פרטי ההזמנה"}
                {step === 3 && "✅ אישור וסיכום"}
              </h1>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Date & Time */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        <Calendar className="w-5 h-5 inline-block ml-2" />
                        תאריך
                      </label>
                      <input
                        type="date"
                        name="reservation_date"
                        value={formData.reservation_date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        <Clock className="w-5 h-5 inline-block ml-2" />
                        שעה
                      </label>
                      <select
                        name="reservation_time"
                        value={formData.reservation_time}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      >
                        <option value="">בחר שעה</option>
                        <option value="19:00">19:00</option>
                        <option value="20:00">20:00</option>
                        <option value="21:00">21:00</option>
                        <option value="22:00">22:00</option>
                        <option value="23:00">23:00</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        <Users className="w-5 h-5 inline-block ml-2" />
                        מספר אורחים
                      </label>
                      <input
                        type="number"
                        name="number_of_guests"
                        value={formData.number_of_guests}
                        onChange={handleChange}
                        required
                        min="1"
                        max="20"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
                        סוג שולחן
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {Object.entries(tableTypes).map(([key, table]) => (
                          <label
                            key={key}
                            style={{
                              padding: "16px",
                              borderRadius: "12px",
                              border: formData.table_type === key 
                                ? "2px solid #00caff" 
                                : "1px solid #1f2937",
                              background: formData.table_type === key 
                                ? "rgba(0, 202, 255, 0.1)" 
                                : "rgba(15,23,42,0.5)",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            <input
                              type="radio"
                              name="table_type"
                              value={key}
                              checked={formData.table_type === key}
                              onChange={handleChange}
                              style={{ marginLeft: "12px" }}
                            />
                            <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                              {table.name}
                            </span>
                            <span style={{ color: "#fbbf24", marginRight: "10px", fontSize: "1.1rem" }}>
                              ₪{table.price}
                            </span>
                            <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: "4px", marginRight: "30px" }}>
                              {table.desc}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        שם מלא *
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        placeholder="לדוגמה: יוסי כהן"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        טלפון *
                      </label>
                      <input
                        type="tel"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        required
                        placeholder="050-1234567"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        אימייל
                      </label>
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        בקשות מיוחדות
                      </label>
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleChange}
                        rows={4}
                        placeholder="יש לכם בקשה מיוחדת? ספרו לנו..."
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "1px solid #1f2937",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          fontSize: "1rem",
                          resize: "none"
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div style={{
                      background: "rgba(0, 202, 255, 0.1)",
                      border: "1px solid rgba(0, 202, 255, 0.3)",
                      borderRadius: "16px",
                      padding: "24px",
                      marginBottom: "24px"
                    }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "16px", color: "#00caff" }}>
                        סיכום ההזמנה
                      </h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "1rem" }}>
                        <div><strong>תאריך:</strong> {formData.reservation_date}</div>
                        <div><strong>שעה:</strong> {formData.reservation_time}</div>
                        <div><strong>מספר אורחים:</strong> {formData.number_of_guests}</div>
                        <div><strong>סוג שולחן:</strong> {tableTypes[formData.table_type].name}</div>
                        <div><strong>שם:</strong> {formData.customer_name}</div>
                        <div><strong>טלפון:</strong> {formData.customer_phone}</div>
                        {formData.customer_email && <div><strong>אימייל:</strong> {formData.customer_email}</div>}
                        
                        <div style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "2px solid rgba(0, 202, 255, 0.3)",
                          fontSize: "1.5rem",
                          fontWeight: "900",
                          color: "#fbbf24"
                        }}>
                          סה"כ לתשלום: ₪{getTotalPrice()}
                        </div>
                      </div>
                    </div>

                    <label style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "16px",
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      marginBottom: "24px"
                    }}>
                      <input
                        type="checkbox"
                        name="terms_accepted"
                        checked={formData.terms_accepted}
                        onChange={handleChange}
                        required
                        style={{ marginTop: "4px" }}
                      />
                      <span style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                        אני מאשר/ת את{" "}
                        <Link
                          to={createPageUrl("Terms")}
                          target="_blank"
                          style={{ color: "#a78bfa", textDecoration: "underline" }}
                        >
                          תקנון המועדון
                        </Link>
                        {" "}ומדיניות הביטול
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "30px"
                }}>
                  {step > 1 && step < 4 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      style={{
                        flex: 1,
                        padding: "16px",
                        borderRadius: "12px",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        background: "transparent",
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      ← חזרה
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #00caff, #0088ff)",
                      color: "#001a2e",
                      fontSize: "1.1rem",
                      fontWeight: "900",
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
                    }}
                  >
                    {step < 3 ? "המשך →" : "אשר הזמנה ✓"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              borderRadius: "24px",
              padding: "60px 40px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
              textAlign: "center"
            }}
          >
            <CheckCircle2 className="w-24 h-24" style={{ color: "#10b981", margin: "0 auto 24px" }} />
            
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              color: "#10b981",
              marginBottom: "16px"
            }}>
              ההזמנה נשלחה בהצלחה! 🎉
            </h2>
            
            <p style={{
              fontSize: "1.2rem",
              color: "#cbd5e1",
              marginBottom: "30px",
              lineHeight: "1.8"
            }}>
              תודה על ההזמנה! נציג יצור איתך קשר בקרוב לאישור סופי.<br />
              פרטי ההזמנה נשלחו לטלפון שהזנת.
            </p>

            <Link
              to={createPageUrl("Landing")}
              style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "linear-gradient(135deg, #00caff, #0088ff)",
                color: "#001a2e",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "800",
                textDecoration: "none",
                boxShadow: "0 0 30px rgba(0, 202, 255, 0.5)"
              }}
            >
              חזרה לדף הבית
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

ReserveTable.isPublic = true;