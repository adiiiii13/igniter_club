import { useEffect } from 'react';

const PARALLAX_LANDING_PATH = '/welcome';

export default function IntroPage() {
  useEffect(() => {
    window.location.replace(PARALLAX_LANDING_PATH);
  }, []);

  return null;
}
