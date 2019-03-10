<template>
    <div>
        <div :class="$style.test">Hallo</div>
        <logo></logo>
    </div>
</template>

<script>
    import Vue              from 'vue';
    import { Component }    from 'vue-property-decorator';
    import Logo             from '@/components/Logo';
	
	@Component({
        components: {
            Logo
        }
    })
    export default class Home extends Vue {
        mounted() {
            console.log('test');
        }
    }
</script>

<style src="../styles/main.scss" lang="scss" module></style>
