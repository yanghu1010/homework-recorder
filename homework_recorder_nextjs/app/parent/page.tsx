"use client";

type Submission = {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string;
  videoUrl: string;
};

const submissions: Submission[] = [
  {
    id: "sub_001",
    title: "今天的英语作业",
    date: "2026-03-23 19:30",
    duration: "01:26",
    status: "已完成",
    videoUrl: "/teacher-demo.mp4",
  },
  {
    id: "sub_002",
    title: "绘本跟读作业",
    date: "2026-03-22 18:10",
    duration: "02:03",
    status: "已完成",
    videoUrl: "/teacher-demo.mp4",
  },
];

export default function ParentPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a" }}>家长端：查看与下载</div>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            正式接入后，这里会展示孩子每次作业提交的视频，支持在线播放与下载。
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr .9fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 28,
              boxShadow: "0 4px 24px rgba(15,23,42,.06)",
              padding: 22,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>作业记录</div>

            <div style={{ display: "grid", gap: 12 }}>
              {submissions.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: 16,
                    borderRadius: 20,
                    background: "#f8fafc",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>提交时间：{item.date}</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>时长：{item.duration}</div>
                  <div style={{ color: "#0f172a", fontSize: 14 }}>状态：{item.status}</div>
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 28,
              boxShadow: "0 4px 24px rgba(15,23,42,.06)",
              padding: 22,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>视频详情</div>
            <video
              controls
              src={submissions[0].videoUrl}
              style={{ width: "100%", borderRadius: 20, background: "black" }}
            />
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <div style={{ color: "#64748b" }}>作业名称：{submissions[0].title}</div>
              <div style={{ color: "#64748b" }}>提交时间：{submissions[0].date}</div>
              <div style={{ color: "#64748b" }}>录制时长：{submissions[0].duration}</div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a
                href={submissions[0].videoUrl}
                download
                style={{
                  background: "#0f172a",
                  color: "white",
                  textDecoration: "none",
                  padding: "14px 22px",
                  borderRadius: 18,
                  fontWeight: 800,
                }}
              >
                下载视频
              </a>
              <a
                href="/"
                style={{
                  background: "white",
                  color: "#0f172a",
                  textDecoration: "none",
                  padding: "14px 22px",
                  borderRadius: 18,
                  border: "1px solid #cbd5e1",
                  fontWeight: 800,
                }}
              >
                返回孩子端
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}