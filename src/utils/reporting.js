class PeakMemory {
  constructor () {
    this.peakMemory = 0;
    this.peakMemoryInterval = null;
  }

  start () {
    this.checkPeakMemory();
    this.peakMemoryInterval = setInterval(() => {
      this.checkPeakMemory();
    }, 1000);
    this.peakMemoryInterval.unref();
  }

  stop () {
    if (this.peakMemoryInterval) {
      clearInterval(this.peakMemoryInterval);
      this.peakMemoryInterval = null;
    }
  }

  checkPeakMemory () {
    const { heapTotal } = process.memoryUsage();
    if (heapTotal > this.peakMemory) {
      this.peakMemory = heapTotal;
    }
  }

  getPeakMB () {
    return (this.peakMemory / 1024 / 1024).toFixed(2);
  }
}

class Reporting {
  constructor (startTime) {
    this.startTime = startTime;
    this.enabledReporting = process.argv.includes('--report');
    this.enabledTimestamp =
      !process.argv.includes('--no-timestamp') || this.enabledReporting;

    if (this.enabledReporting) {
      this.peakMemory = new PeakMemory();
      this.peakMemory.start();
    }
  }

  report () {
    return {
      totalTime:
        this.enabledTimestamp || this.enabledReporting
          ? +new Date() - this.startTime
          : undefined,
      peakMB: this.enabledReporting ? this.peakMemory.getPeakMB() : undefined
    };
  }

  stop () {
    this.enabledReporting && this.peakMemory.stop();
  }
}

module.exports = Reporting;
