import { ServiceManager } from '../../services/service-manager/service-manager';
import { ServiceAnalytics } from '../../services/service-analytics/service-analytics';
import { LoaderService } from '../../services/views/loader.service';
import { TracerService } from '../../services/opentelemetry/tracer.service';

export class BannerService {
  private serviceManager: ServiceManager;
  private serviceAnalytics: ServiceAnalytics;
  private tracer: TracerService;

  constructor() {
    this.serviceManager = new ServiceManager();
    this.serviceAnalytics = new ServiceAnalytics();
    this.tracer = new TracerService();
  }

  async runRedirect(queryParamsRedirectUrl, alliedInfo, purchaseValue, purchaseProducts) {
    try {
      LoaderService.openLoader();
      this.tracer.registerCustomTrace('financing-btn-redirect-start');
      const dispatcherRqUID = await this.serviceManager.dispatcherService(queryParamsRedirectUrl, alliedInfo);
      const eventType = ANALYTIC_EVENT_TYPES.CLICK_BANNER_BTN;
      this.serviceAnalytics.publishAnalytics(
        queryParamsRedirectUrl,
        eventType,
        dispatcherRqUID,
        purchaseValue,
        purchaseProducts
      );
    } catch (error) {
      console.error('Error during redirect:', error.message);
    }
  }
}
