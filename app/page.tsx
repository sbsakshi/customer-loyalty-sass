"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, TrendingUp, CreditCard, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen pb-20 bg-slate-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Welcome to <br className="sm:hidden" />
              <span className="text-orange-600">Manbhavan</span> Store
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Manage your loyal customers, track points, and grow your business with our premium loyalty suite.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="relative overflow-hidden group border-white/60 bg-white/60">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Users size={120} />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Customers</p>
                <h3 className="text-2xl font-bold text-slate-900">1,248</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-600">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-medium">+12%</span>
              <span className="text-slate-400 ml-1">from last month</span>
            </div>
          </Card>

          <Card className="relative overflow-hidden group border-white/60 bg-white/60">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <CreditCard size={120} />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Points Distributed</p>
                <h3 className="text-2xl font-bold text-slate-900">85,400</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-600">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-medium">+5.4%</span>
              <span className="text-slate-400 ml-1">today</span>
            </div>
          </Card>

          <Card className="bg-orange-300 text-white border-none group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Quick Action</h3>
              <p className="text-orange-100 text-sm mb-6">Create a new bill instantly for a waiting customer.</p>
              <Link href="/billing">
                <Button variant="secondary" className="w-full justify-between group-hover:bg-emerald-400 shadow-none border-none">
                  New Bill
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>

        {/* Quick Navigation Cards */}
        <h2 className="text-xl font-bold text-slate-900 mb-6">Manage Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/customers" className="block">
            <Card className="h-full hover:border-orange-200 group cursor-pointer transition-all bg-white/80">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">Customer Database</h3>
                  <p className="text-slate-500 text-sm">View all registered customers, search by phone, and manage memberships.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                  <Users className="text-slate-400 group-hover:text-orange-600" size={20} />
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/customers" className="block">
            <Card className="h-full hover:border-orange-200 group cursor-pointer transition-all bg-white/80">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-500 transition-colors">Register Customer</h3>
                  <p className="text-slate-500 text-sm">Add a new customer to the loyalty program quickly.</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <Users className="text-emerald-400 group-hover:text-emerald-600" size={20} />
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/reports" className="block">
            <Card className="h-full hover:border-orange-200 group cursor-pointer transition-all bg-white/80">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">Sales Reports</h3>
                  <p className="text-slate-500 text-sm">Analyze daily sales, point redemptions, and customer growth trends.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                  <TrendingUp className="text-slate-400 group-hover:text-orange-600" size={20} />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
