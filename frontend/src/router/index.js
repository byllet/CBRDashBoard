import { createRouter, createWebHistory } from 'vue-router'
import ExchangeRates from '../pages/ExchangeRates.vue'
import CreditRates from '../pages/CreditRates.vue'
import CreditStats from '../pages/CreditStats.vue'
import MonetaryAggregates from '../pages/MonetaryAggregates.vue'
import DepositRates from '../pages/DepositRates.vue'

const routes = [
  {
    path: '/',
    name: 'ExchangeRates',
    component: ExchangeRates
  },
  {
    path: '/credit_stats',
    name: 'CreditStats',
    component: CreditStats
  },
  {
    path: '/monetary_aggregates',
    name: 'MonetaryAggregates',
    component: MonetaryAggregates
  },
  {
    path: '/deposit_rates',
    name: 'DepositRates',
    component: DepositRates
  },
  {
    path: '/credit_rates',
    name: 'CreditRates',
    component: CreditRates
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router