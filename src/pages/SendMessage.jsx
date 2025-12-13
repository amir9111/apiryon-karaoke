import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import ApyironLogo from "../components/ApyironLogo";
import SendMessageToScreen from "../components/SendMessageToScreen";

export default function SendMessage() {
  return (
    <div 
      dir="rtl"
      className="min-h-screen w-full flex justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1929 50%, #020617 100%)", color: "#f9fafb" }}
    >
      <div className="w-full max-w-[480px]">
        {/* Back Button */}
        <Link 
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 mb-4 text-[#00caff] hover:text-[#0088ff] transition-colors"
          style={{ textDecoration: "none" }}
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-semibold">חזרה לדף הבית</span>
        </Link>

        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <ApyironLogo size="medium" showCircle={true} />
        </div>

        <div
          className="rounded-[18px] p-5 md:p-6"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 10px 30px rgba(0, 202, 255, 0.2), 0 0 80px rgba(0, 136, 255, 0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 202, 255, 0.2)"
          }}
        >
          <h1 className="text-[1.6rem] md:text-[1.9rem] font-bold text-center mb-2" style={{
            color: "#a78bfa",
            textShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
          }}>
            שלח הודעה למסך הקהל 💬
          </h1>
          <p className="text-[0.9rem] text-center mb-6" style={{ color: "#cbd5f5" }}>
            ההודעה שלך תרוץ על המסך בזמן שזמר מבצע
          </p>

          <SendMessageToScreen />

          <div className="mt-6 p-4 rounded-xl" style={{
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)"
          }}>
            <h3 className="font-bold text-[#a78bfa] mb-2">💡 איך זה עובד?</h3>
            <ul className="text-sm space-y-1" style={{ color: "#cbd5e1" }}>
              <li>• ההודעה תופיע רק כשיש זמר על הבמה</li>
              <li>• ההודעה תרוץ על המסך למשך 30 שניות</li>
              <li>• ניתן לשלוח הודעה אחת בכל 30 שניות</li>
              <li>• ההודעה תרוץ ברקע בצורה מנופשת</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

SendMessage.isPublic = true;