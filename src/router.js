import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Properties from './pages/Properties.vue';
import PropertyDetails from './pages/PropertyDetails.vue';

import Profile from './pages/Profile.vue';
import BecomeAHost from './pages/BecomeAHost.vue';
import HostLocation from './pages/HostLocation.vue';
import ConfirmAddress from './pages/ConfirmAddress.vue';
import PlaceBasics from './pages/PlaceBasics.vue';
import HouseAdded from './pages/HouseAdded.vue';
import HouseNameImages from './pages/HouseNameImages.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/properties', component: Properties },
  { path: '/property/:id', component: PropertyDetails },
  { path: '/profile', component: Profile },
  { path: '/become-a-host', component: BecomeAHost },
  { path: '/host-location', component: HostLocation },
  { path: '/confirm-address', component: ConfirmAddress },
  { path: '/place-basics', component: PlaceBasics },
  { path: '/house-added', component: HouseAdded },
  { path: '/house-name-images', component: HouseNameImages },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
