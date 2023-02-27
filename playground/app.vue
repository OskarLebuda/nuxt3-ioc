<template>
  <div>

    items: <br>
    {{ items }}

    <button @click="handleClick">Load data</button>
  </div>
</template>

<script setup>
  import { defineIOCModule } from '../src/runtime/defines/defineIOCModule';
  import iocProvider from './ioc/global.ioc';
  import TestService from './service/TestService';

  const items = ref([]);

  defineIOCModule(iocProvider);

  const gTestService = useIOC(TestService);

  const handleClick = async () => {
    await gTestService.loadData();

    items.value.push(...gTestService.state.items);
  }

</script>