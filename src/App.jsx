import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Loading from "./components/Loading.jsx";
import { cpuService } from "./services/cpuServices.jsx";
import "./App.css";

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const heartbeatRef = useRef(null);
  const autoRetryRef = useRef(null);

  useEffect(() => {
    let loadingTimer = null;

    const checkSessionStatus = async () => {
      const localToken = sessionStorage.getItem("gatekeeper_token");

      try {
        const res = await cpuService.checkStatus(localToken);
        return { success: true, token: res.token };
      } catch (err) {
        if (err.message) {
          return {
            success: false,
            message: err.message || "Access denied.",
          };
        }
        return { success: false, message: "Failed to connect to trainer." };
      }
    };

    const startOrMonitorSession = async () => {
      const result = await checkSessionStatus();
      if (loadingTimer) clearTimeout(loadingTimer);

      if (result.success) {
        sessionStorage.setItem("gatekeeper_token", result.token);

        if (autoRetryRef.current) {
          clearInterval(autoRetryRef.current);
          autoRetryRef.current = null;
        }

        setIsAuthorized(true);

        loadingTimer = setTimeout(() => {
          setIsLoading(false);
        }, 1000);

        if (!heartbeatRef.current) {
          heartbeatRef.current = setInterval(async () => {
            const currentToken = sessionStorage.getItem("gatekeeper_token");
            try {
              await cpuService.sendHeartbeat(currentToken);
            } catch (err) {
              handleKick("Your session has ended or been taken over.");
            }
          }, 4000);
        }
      } else {
        setErrorMessage(result.message);
        setIsAuthorized(false);

        loadingTimer = setTimeout(() => {
          setIsLoading(false);
        }, 1000);

        if (!autoRetryRef.current) {
          autoRetryRef.current = setInterval(() => {
            startOrMonitorSession();
          }, 3000);
        }
      }
    };

    const handleKick = (message) => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (autoRetryRef.current) {
        clearInterval(autoRetryRef.current);
        autoRetryRef.current = null;
      }
      sessionStorage.removeItem("gatekeeper_token");
      setErrorMessage(message);
      setIsAuthorized(false);
      startOrMonitorSession();
    };

    startOrMonitorSession();

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (autoRetryRef.current) clearInterval(autoRetryRef.current);
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <Loading />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex text-center justify-center h-screen flex-col gap-4 bg-[var(--bg)]">
        <h2
          className="text-4xl underline"
          style={{ color: "red", fontWeight: "bold" }}
        >
          Access Locked
        </h2>
        <p className="text-xl" style={{ color: "red" }}>
          {errorMessage}
        </p>
        <p className="text-xl" style={{ color: "red" }}>
          Close other browser tabs that have this application open in order to
          log in.
        </p>
        <div className="text-sm animate-pulse">
          Monitoring the device, you will be logged in automatically if a slot
          becomes available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-fit bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 pt-6 h-full p-4">
        <Outlet />
      </main>
    </div>
  );
}
