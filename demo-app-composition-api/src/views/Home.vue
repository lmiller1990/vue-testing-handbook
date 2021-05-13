<template>
  <div class="home">
    <Greeting />
    <SubmitButton msg="Login" />
    <SubmitButton msg="Logout" isAdmin="true" />
  </div>
</template>

<script>
// @ is an alias to /src
import Greeting from '../components/Greeting.vue';
import SubmitButton from '../components/SubmitButton.vue';

export default {
  name: 'Home',
  components: {
    Greeting,
    SubmitButton,
  },
};
</script>
