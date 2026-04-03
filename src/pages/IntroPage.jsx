export default function IntroPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe 
        src="/intro/index.html" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Parallax Welcome Intro"
      />
    </div>
  );
}
