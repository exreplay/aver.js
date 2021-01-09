import {
  VuexClass,
  VuexModule,
  HasGetterAndMutation,
  getModule,
  Action
} from '@averjs/vuex-decorators';

@VuexClass({
  persistent: ['persist']
})
export default class TestStore extends VuexModule {
  moduleName = 'testModule';

  @HasGetterAndMutation persist = '';
  @HasGetterAndMutation test = 'hello from class based vuex module';
  @HasGetterAndMutation host = '';

  @Action serverInit({ req }) {
    this.host = req.protocol + '://' + req.get('host');
  }
}

export const TestModule = getModule(TestStore);
