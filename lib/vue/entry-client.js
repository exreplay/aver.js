import { createApp }        from './app';
import Vue                  from 'vue';
import VueProgressBar       from 'vue-progressbar';
import axios                from 'axios';
import { forEach }          from 'lodash';
import 'babel-polyfill';
const { app, router, store } = createApp({isServer: false});

// eslint-disable-next-line no-unused-vars
class ClientEntry {
    constructor() {
        this.addMobileCheck();
        this.setupResponsiveBootstrapToolkit();
        this.configureCSRF();
        this.setRouterMixins();
        this.initProgressBar();
        this.initMixin();

        router.onReady(() => {
            router.beforeResolve((to, from, next) => {
                const matched = router.getMatchedComponents(to);
                const prevMatched = router.getMatchedComponents(from);
                let diffed = false;
                const activated = matched.filter((c, i) => {
                    return diffed || (diffed = (prevMatched[i] !== c));
                });
                const asyncDataHooks = activated.map(c => c.options.asyncData).filter(_ => _);
                if (!asyncDataHooks.length) {
                    return next();
                }
                Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
                    .then(() => {
                        next();
                    })
                    .catch(next);
            });

            app.$mount('#app');
        });
    }

    initMixin() {
        const mixinContext = require.context('@/', false, /^\.\/entry-client\.js$/i);
        
        forEach(mixinContext.keys(), r => {
            const EntryClientMixin = mixinContext(r).default;
            if (typeof EntryClientMixin !== 'undefined') {
                const mixin = new EntryClientMixin();
            }
        });
    }

    addMobileCheck() {
        Vue.prototype.$isMobile = () => {
            let check = false;
            ((a) => {
                // eslint-disable-next-line no-useless-escape
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                    check = true;
                }
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };
    }

    initProgressBar() {
        const options = {
            color: '#003B8E',
            failedColor: '#E0001A',
            thickness: '2px',
            transition: {
                speed: '0.2s',
                opacity: '0.6s',
                termination: 300
            },
            autoRevert: true,
            location: 'top',
            inverse: false
        };

        Vue.use(VueProgressBar, options);
    }
    
    setupResponsiveBootstrapToolkit() {
        const visibilityDivs = {
            'xs': $('<div class="device-xs d-block d-sm-none"></div>'),
            'sm': $('<div class="device-sm d-none d-sm-block d-md-none"></div>'),
            'md': $('<div class="device-md d-none d-md-block d-lg-none"></div>'),
            'lg': $('<div class="device-lg d-none d-lg-block d-xl-none"></div>'),
            'xl': $('<div class="device-xl d-none d-xl-block"></div>')
        };
        
        const viewport = require('responsive-toolkit');
        viewport.use('Custom', visibilityDivs);
        Vue.prototype.$viewport = viewport;
    }

    configureCSRF() {
        let token = document.querySelector('meta[name="csrf-token"]');

        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
            Vue.prototype.$csrf = token.content;
        } else {
            console.error('CSRF token not found');
        }
    }

    setRouterMixins() {
        Vue.mixin({
            beforeMount () {
                const { asyncData } = this.$options;
                if (asyncData) {
                    this.dataPromise = asyncData({
                        store: this.$store,
                        route: this.$route
                    })
                }
            }
        });
    }
}

// eslint-disable-next-line no-unused-vars
const clientEntry = new ClientEntry();
