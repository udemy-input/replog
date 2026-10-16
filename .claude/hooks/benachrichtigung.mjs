// Notification-Hook: Desktop-Benachrichtigung, wenn Claude auf dich wartet (Windows, macOS, Linux).
import { execFileSync } from "node:child_process";

const input = JSON.parse(await new Response(process.stdin).text());
const text = (input.message ?? "Claude Code wartet auf dich").replace(/["'`]/g, "");

try {
  if (process.platform === "win32") {
    const ps = `Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; ` +
      `$n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, 'Claude Code', '${text}', 'Info'); Start-Sleep 6; $n.Dispose()`;
    execFileSync("powershell", ["-NoProfile", "-Command", ps]);
  } else if (process.platform === "darwin") {
    execFileSync("osascript", ["-e", `display notification "${text}" with title "Claude Code"`]);
  } else {
    execFileSync("notify-send", ["Claude Code", text]);
  }
} catch {
  // keine Benachrichtigung möglich – Claude trotzdem nicht stören
}
