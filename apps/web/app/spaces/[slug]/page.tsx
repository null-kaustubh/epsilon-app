import Canvas from "../../../features/canvas/canvas";

export default function Home() {
  return (
    <>
      <div className="hidden pointer-coarse:flex xl:max-[1279px]:flex min-h-dvh items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Desktop only</h2>
          <p className="text-muted-foreground mt-2">
            The canvas is only available on desktop. Please open this page on a
            larger screen.
          </p>
        </div>
      </div>

      <div className="pointer-coarse:hidden xl:pointer-fine:block hidden h-screen">
        <Canvas />
      </div>
    </>
  );
}
