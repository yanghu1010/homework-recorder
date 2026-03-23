"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PromptItem = {
  text: string;
  zh: string;
};

const prompts: PromptItem[] = [
  { text: "Hello teacher, I am ready.", zh: "请跟着读：Hello teacher, I am ready." },
  { text: "Please show me your book.", zh: "请把书举起来给老师看" },
  { text: "Please read this page.", zh: "请读这一页内容" },
  { text: "What do you see in the picture?", zh: "你在图片里看到了什么？" },
  { text: "Great job. Say goodbye.", zh: "很好，请说再见" },
];

const steps = ["首页", "老师示范", "准备物品", "录制作业", "完成上传"] as const;
type StepKey = 0 | 1 | 2 | 3 | 4;

export default function Page() {
  const [step, setStep] = useState<StepKey>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<number>(-1);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [usingDemoMode, setUsingDemoMode] = useState(true);

  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const previewRef = useRef<HTMLVideoElement | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isRecording]);

  async function requestDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraReady(true);
      setMicReady(true);
      setUsingDemoMode(false);

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play().catch(() => null);
      }
      return stream;
    } catch {
      setUsingDemoMode(true);
      return null;
    }
  }

  function speak(text: string) {
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.82;
    window.speechSynthesis?.speak(utter);
  }

  function playPrompt(index: number) {
    setCurrentPrompt(index);
    speak(prompts[index].text);
  }

  function repeatPrompt() {
    if (currentPrompt >= 0) {
      speak(prompts[currentPrompt].text);
    }
  }

  function nextPrompt() {
    if (currentPrompt < 0) return;
    if (currentPrompt >= prompts.length - 1) return;
    playPrompt(currentPrompt + 1);
  }

  async function startRecord() {
    const stream = await requestDevices();
    setCountdown(3);

    const countdownTimer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(countdownTimer);
          setIsRecording(true);
          setElapsed(0);
          setCountdown(null);
          setCurrentPrompt(0);

          if (stream) {
            const type = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
              ? "video/webm;codecs=vp9"
              : "video/webm";

            const recorder = new MediaRecorder(stream, { mimeType: type });
            recordedChunksRef.current = [];
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
              }
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
          }

          window.setTimeout(() => playPrompt(0), 500);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function stopRecord() {
    setIsRecording(false);
    window.speechSynthesis?.cancel();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
    }

    // 这里是正式上传接口预留位置：
    // 1. POST /api/kid/submissions 创建提交记录
    // 2. POST /api/kid/submissions/:id/upload-sign 获取对象存储签名
    // 3. 直传 Blob 到云端
    // 4. POST /api/kid/submissions/:id/complete 上报完成

    setStep(4);
  }

  function resetAll() {
    window.speechSynthesis?.cancel();
    setStep(0);
    setCountdown(null);
    setIsRecording(false);
    setElapsed(0);
    setCurrentPrompt(-1);
  }

  function formatTime(seconds: number) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="page-shell">
      <div className="layout">
        <aside className="card sidebar">
          <div style={{ fontSize: 28, fontWeight: 800 }}>学习机英语作业</div>
          <div className="muted" style={{ marginTop: 6 }}>儿童语音引导版正式前端骨架</div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div>
            {steps.map((label, idx) => (
              <div key={label} className={`step ${idx === step ? "active" : ""}`}>
                <div className="step-num">{idx + 1}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
          <div className="box" style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>正式开发说明</div>
            <div className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              已预留摄像头、麦克风、录制与上传接口位置。你部署后，把老师视频和云端上传接口接上，就能继续开发。
            </div>
          </div>
        </aside>

        <main className="card main">
          {step === 0 && (
            <section className="hero">
              <div>
                <div className="badge">今日任务</div>
                <h1 className="big">今天的英语作业</h1>
                <p className="muted" style={{ fontSize: 18, marginTop: 12 }}>
                  先看老师视频，再按提示准备物品，最后开始录制作业并保存到云端。
                </p>
                <div className="grid3">
                  <div className="box"><div style={{ fontWeight: 800 }}>先看视频</div><div className="muted" style={{ marginTop: 6 }}>先看老师的示范内容</div></div>
                  <div className="box"><div style={{ fontWeight: 800 }}>听声音跟着做</div><div className="muted" style={{ marginTop: 6 }}>孩子不会看字也能完成</div></div>
                  <div className="box"><div style={{ fontWeight: 800 }}>自动保存</div><div className="muted" style={{ marginTop: 6 }}>完成后上传到云端</div></div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => setStep(1)}>开始今天的作业</button>
                </div>
              </div>

              <div className="phone">
                <div className="screen">
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>欢迎开始</div>
                    <div className="muted" style={{ marginTop: 8 }}>看老师视频 → 准备物品 → 开始录制 → 上传保存</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 style={{ marginTop: 0, fontSize: 30 }}>先看老师示范视频</h2>
              <p className="muted">把你自己的老师视频地址换到这里即可。</p>
              <div className="video-frame">
                <video
                  controls
                  src="/teacher-demo.mp4"
                  style={{ width: "100%", display: "block", background: "black" }}
                />
              </div>
              <div className="btn-row">
                <button className="btn-secondary" onClick={() => setStep(0)}>返回首页</button>
                <button className="btn" onClick={() => setStep(2)}>我看完了</button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="two-col">
              <div>
                <h2 style={{ marginTop: 0, fontSize: 30 }}>开始前准备一下</h2>
                <p className="muted">准备好后，就可以开始录制作业。</p>
                {["准备好今天的绘本/作业本", "把书和铅笔放在桌上", "坐在镜头前，保持安静"].map((item, idx) => (
                  <div key={item} className="box" style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div className="step-num">{idx + 1}</div>
                    <div>{item}</div>
                  </div>
                ))}
                <div className="btn-row">
                  <button className="btn-secondary" onClick={() => setStep(1)}>返回上一页</button>
                  <button className="btn" onClick={() => setStep(3)}>我准备好了</button>
                </div>
              </div>

              <div className="phone">
                <div className="screen">
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>录制小提示</div>
                    <div className="muted" style={{ marginTop: 8 }}>脸和书本尽量都出现在画面里，讲话稍微大声一点。</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="two-col">
              <div>
                <h2 style={{ marginTop: 0, fontSize: 30 }}>录制作业中</h2>
                <p className="muted">每一句会自动读出来，孩子说完后再点“下一句”。</p>

                <div className="preview">
                  {isRecording && <div className="record-badge">录制中 {formatTime(elapsed)}</div>}
                  {countdown !== null && <div className="countdown">{countdown}</div>}

                  {usingDemoMode ? (
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>摄像头预览区</div>
                      <div style={{ color: "rgba(255,255,255,.75)", marginTop: 8 }}>如果浏览器给了权限，这里会自动显示真实摄像头画面。</div>
                    </div>
                  ) : (
                    <video ref={previewRef} muted playsInline autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                <div className="btn-row">
                  {!isRecording ? (
                    <button className="btn" onClick={startRecord}>开始录制</button>
                  ) : (
                    <button className="btn" onClick={stopRecord}>结束并上传</button>
                  )}
                  <button className="btn-secondary" onClick={() => setStep(2)}>返回准备页</button>
                </div>
              </div>

              <div>
                <div className="card" style={{ boxShadow: "none", border: "1px solid #e2e8f0", padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>互动提示</div>
                  {prompts.map((item, idx) => (
                    <div key={item.text} className={`prompt ${idx === currentPrompt ? "active" : ""}`}>
                      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>提示 {idx + 1}</div>
                      <div style={{ fontWeight: 800 }}>{item.text}</div>
                      <div style={{ fontSize: 13, opacity: 0.78, marginTop: 6 }}>{item.zh}</div>
                    </div>
                  ))}

                  <div className="listen-wrap">
                    <button className="listen-btn" onClick={repeatPrompt} disabled={!isRecording}>
                      <span className="listen-emoji">🔊</span>
                      <span>点我再读一遍</span>
                    </button>
                    <div className="kid-tip">孩子不会看英文也没关系，先点“再读一遍”，让他听，再跟着说。</div>
                  </div>

                  <div className="btn-row">
                    <button className="btn" onClick={nextPrompt} disabled={!isRecording || currentPrompt >= prompts.length - 1}>
                      我说完了，下一句
                    </button>
                  </div>
                </div>

                <div className="card" style={{ boxShadow: "none", border: "1px solid #e2e8f0", padding: 20, marginTop: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>设备状态</div>
                  <div className="box" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                    <span>摄像头权限</span>
                    <strong>{cameraReady || usingDemoMode ? "正常" : "未开启"}</strong>
                  </div>
                  <div className="box" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                    <span>麦克风权限</span>
                    <strong>{micReady || usingDemoMode ? "正常" : "未开启"}</strong>
                  </div>
                  <div className="box" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>录制状态</span>
                    <strong>{isRecording ? "录制中" : countdown !== null ? "倒计时中" : "未开始"}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section style={{ maxWidth: 780, margin: "0 auto", textAlign: "center", paddingTop: 20 }}>
              <div style={{ fontSize: 56 }}>✅</div>
              <h2 style={{ fontSize: 34, margin: "10px 0 6px" }}>作业已上传保存</h2>
              <p className="muted">这里先显示完成页。你把上传接口接上后，就能显示真实云端保存结果。</p>
              <div className="summary">
                <div className="box"><div className="muted" style={{ fontSize: 13 }}>作业名称</div><div style={{ fontWeight: 800, marginTop: 8 }}>今天的英语作业</div></div>
                <div className="box"><div className="muted" style={{ fontSize: 13 }}>录制时长</div><div style={{ fontWeight: 800, marginTop: 8 }}>{formatTime(elapsed)}</div></div>
                <div className="box"><div className="muted" style={{ fontSize: 13 }}>保存状态</div><div style={{ fontWeight: 800, marginTop: 8 }}>已完成</div></div>
              </div>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <button className="btn" onClick={resetAll}>再做一次</button>
                <button className="btn-secondary" onClick={() => setStep(0)}>返回首页</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}