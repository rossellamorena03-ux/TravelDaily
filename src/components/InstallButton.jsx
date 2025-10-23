import { useState, useEffect } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Impedisce al browser di mostrare il prompt automatico
      e.preventDefault();
      // Salva l’evento per usarlo dopo
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra il prompt di installazione
    deferredPrompt.prompt();

    // Aspetta la scelta dell’utente
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Risultato installazione: ${outcome}`);

    // Reset dell’evento
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <button onClick={handleInstallClick}>
      Installa app
    </button>
  );
}

export default InstallButton;
