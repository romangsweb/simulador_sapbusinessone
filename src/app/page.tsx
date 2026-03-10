import WizardForm from '@/components/WizardForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative w-full items-center justify-center p-4 py-12 md:py-24 overflow-x-hidden pt-20">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-20%] w-[30vw] h-[30vw] rounded-full bg-fuchsia-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full text-center px-4 mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-[length:200%_auto] animate-gradient">
            Cotizador Interactivo
          </span>
          <br className="hidden md:block" />
          <span className="text-white drop-shadow-md"> Xamai</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Diseñamos una experiencia guiada para encontrar el software y dimensionar tu equipo, presentándote una <strong>cotización aproximada</strong> de tu proyecto. Toma en cuenta que es necesario tener una sesión más profunda con nuestros consultores para llegar al número final.
        </p>
      </div>

      <div className="w-full relative z-20 px-4">
        <WizardForm />
      </div>
    </main>
  );
}
