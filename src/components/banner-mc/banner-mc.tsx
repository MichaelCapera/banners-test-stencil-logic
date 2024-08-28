import { Component, Host, h, Prop, State } from '@stencil/core';
import { BannerProps, BannerState } from './banner-types';
import { BannerService } from './banner-service';
import { getImagePath } from './banner-utils';
import { RedirectUrlValues } from '../../constant/UrlParameters';
import { ValidatePreRender } from '../../services/validate-pre-render/validate-pre-render';
import { AlliedInfo } from '../../models/allied-info';
import { InfoBanner } from '../../models/info-banner';
import { AGREEMENT, ALLIES, PRODUCT_BDB } from '../../constant';

@Component({
  tag: 'bdb-ec4-banner',
  styleUrl: 'bdb-ec4-banner.scss',
  shadow: true,
})
export class BdbEc4Banner {
  private bannerService = new BannerService();
  private validatePreRender = new ValidatePreRender();

  @Prop() ally: BannerProps['ally'];
  @Prop() type: BannerProps['type'] = '';
  @Prop() cta: BannerProps['cta'] = false;
  @Prop() hasCta: BannerProps['hasCta'] = false;
  @Prop() hasRedirect: BannerProps['hasRedirect'] = false;
  @Prop() isCheckout: BannerProps['isCheckout'] = false;
  @Prop() purchaseProducts: BannerProps['purchaseProducts'] = '';
  @Prop() purchaseReference: BannerProps['purchaseReference'] = '';
  @Prop() purchaseValue: BannerProps['purchaseValue'] = 0;
  @Prop() agreement: BannerProps['agreement'] = AGREEMENT.DIGITAL;

  @State() product: BannerState['product'];
  @State() infoBanner: BannerState['infoBanner'];
  @State() productName: BannerState['productName'];
  @State() showBanner: BannerState['showBanner'] = true;
  @State() alliedInfo: BannerState['alliedInfo'] = new AlliedInfo();
  @State() isPdp: BannerState['isPdp'] = false;

  async componentWillLoad() {
    this.queryParamsRedirectUrl = RedirectUrlValues(
      { name: this.alliedInfo.alliedShortName, code: this.alliedInfo.allyCode, branch: this.alliedInfo.allyBranchCode, agreement: this.agreement },
      { amount: this.purchaseValue, reference: this.purchaseReference },
      this.originEcommerce,
      this.alliedInfo.policies,
      ''
    ).find(product => product.productName === this.productName && product.agreement === this.agreement);
  }

  async componentDidLoad() {
    await this.getAlliedInfo();
  }

  render() {
    if (!this.showBanner) {
      return <Host />;
    }

    return (
      <Host id={this.idElement}>
        <div
          class={this.cta ? 'container__banner click' : 'container__banner'}
          id={this.infoBanner.background}
          onClick={this.cta ? () => this.bannerService.runRedirect(this.queryParamsRedirectUrl, this.alliedInfo, this.purchaseValue, this.purchaseProducts) : undefined}
        >
          <div class='container__banner__left'>
            <LogoSection />
            <TextSection cta={this.cta} infoBanner={this.infoBanner} />
            <ButtonSection cta={this.cta} buttonText={this.infoBanner.buttonText} />
          </div>
          <ImageSection infoBanner={this.infoBanner} />
        </div>
      </Host>
    );
  }

  private async enableBanner() {
    try {
      this.validateTypeProduct();
      this.cta ? this.validateBannerTcCta() : this.validateBannerInf();
      this.showBanner = true;
    } catch (error) {
      this.showBanner = false;
      console.error(error.message);
    }
  }

  private validateTypeProduct() {
    this.productName = this.type === 'TC' ? PRODUCT_BDB.TARJETA_CREDITO : this.type === 'CC' ? PRODUCT_BDB.CREDI_CONVENIO : throw new Error('Error: The type of product does not exist in the banners');
  }

  private validateBannerTcCta() {
    this.infoBanner = {
      [ALLIES.MOVISTAR]: infoBanner[1],
      [ALLIES.LATAM]: infoBanner[2],
      default: infoBanner[0]
    }[this.ally] || infoBanner[0];
  }

  private validateBannerInf() {
    this.infoBanner = this.type === 'TC' ? infoBanner[3] : this.type === 'CC' ? infoBanner[4] : this.infoBanner;
  }

  private async getAlliedInfo() {
    try {
      this.purchaseValue = 1000000;  // Valor de ejemplo
      const { allyToken } = this.appState.constants;
      this.validatePreRender.init(allyToken);
      const { alliedInfo, bankFees, installmentsData } = await this.financingUtils.validateWidgetRender(
        this.alliedInfo,
        this.purchaseValue,
        this.productName,
        this.isPdp,
      );

      this.alliedInfo = alliedInfo;
      console.log('Allied info ==>', alliedInfo);
      console.log('bankFees ==>', bankFees);
      console.log('installmentsData ==>', installmentsData);
    } catch (error) {
      console.error('Error fetching allied info:', error.message);
    }
  }
}

// LogoSection.tsx
const LogoSection = () => (
  <div class='container__banner__left__logo-bdb'>
    <img class='container__banner__left__logo-bdb__name' src={getImagePath('bdbLogoNameBlack')} />
    <img class='container__banner__left__logo-bdb__icon' src={getImagePath('bdbLogoIconBlack')} />
    <img class='container__banner__left__logo-bdb__name--vertical' src={getImagePath('bdbLogoNameBlackVertical')} />
  </div>
);

// TextSection.tsx
const TextSection = ({ cta, infoBanner }) => (
  <div class='container__banner__left__text'>
    <div class={cta ? 'container__banner__left__text__product--cta' : 'container__banner__left__text__product'}>
      {infoBanner.productName}
    </div>
    <div class={cta ? 'container__banner__left__text__offer--cta' : 'container__banner__left__text__offer'}>
      {infoBanner.offer}
    </div>
    <div class={cta ? 'hide' : 'container__banner__left__text__checkout'}>
      {infoBanner.offerDescription}
    </div>
  </div>
);

// ButtonSection.tsx
const ButtonSection = ({ cta, buttonText }) => (
  <div class={cta ? 'container__banner__left__button-bdb' : 'hide'}>
    <button class='bdb-at-btn bdb-at-btn--secondary bdb-at-btn--lg'>
      {buttonText}
      <span>›</span>
    </button>
  </div>
);

// ImageSection.tsx
const ImageSection = ({ infoBanner }) => (
  <div class='container__banner__image'>
    <img class='container__banner__image--desktop' src={getImagePath(infoBanner.imageDesktop)} />
    <img class='container__banner__image--mobile' src={getImagePath(infoBanner.imageMobile)} />
  </div>
);
