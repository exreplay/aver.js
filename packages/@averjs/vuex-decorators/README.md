# Vuex Decorators

## Installation
TODO

## Example

### Decorators

- @VuexClass 
- @Getter
- @HasGetter
- @Mutation
- @HasGetterAndMutation
- @Action
- @ExportVuexStore

### Vuex file
```js
import { VuexClass, Action, Getter HasGetterAndMutation } from '@averjs/vuex-decorators';
import axios from 'axios';
import map from 'lodash/map';

@VuexClass
export default class TestStore {
    moduleName = 'test';

    test = 'test';

    // generates getter and mutation with name of variable
    @HasGetterAndMutation testArray = [];

    // generates getter
    get newTest() {
        return map(this.test, test => test = '');
    }

    @Action async fetchTest() {
        try {
            const { data } = await axios({
                url: `test`,
                method: 'GET'
            });

            this.$store.commit('test', data.test);
        } catch (err) {
            throw err;
        }
    }
}

```

### Usage with Vuex
```js
import Vuex from 'vuex';
import { ExportVuexStore } from '@averjs/vuex-decorators';
import VuexFile from './VuexFile.js';

const vuexFile = ExportVuexStore(VuexFile);

new Vuex.Store({
    modules: {
        [vuexFile.moduleName]: vuexFile
    }
});
```