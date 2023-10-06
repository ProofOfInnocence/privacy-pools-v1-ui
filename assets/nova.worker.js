async function generate_params(mode, pp_path) {
    const multiThread = await import("nova_scotia_browser");
    await multiThread.default();
    //await multiThread.initThreadPool(navigator.hardwareConcurrency);
  
    return await multiThread.generate_params(mode, pp_path);
}
generate_params(0, "poi.r1cs")
