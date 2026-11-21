'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingBag,
  Shirt,
  Users,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Cpu,
  UserCheck,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { formatPrice, formatDate } from '@/lib/utils';

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex items-center justify-center text-center px-6 text-xs text-[#888888]">{children}</div>;
}

export default function AdminDashboardPage() {
  const products = useCommerceStore((state) => state.products);
  const orders = useCommerceStore((state) => state.orders);
  const customers = useCommerceStore((state) => state.customers);
  const categories = useCommerceStore((state) => state.categories);
  const settings = useCommerceStore((state) => state.settings);
  const hellobeeMembers = useCommerceStore((state) => state.hellobeeMembers);
  const commissions = useCommerceStore((state) => state.commissions);

  // Dynamic KPI calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Machine & financial breakdown
  const financialBreakdown = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    let machineInflow = 0;
    let machineUnitsSold = 0;

    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        machineInflow += it.price * it.quantity;
        machineUnitsSold += it.quantity;
      });
    });

    // If no itemized lines exist, fallback to total revenue or network sales volume
    const memberVolume = hellobeeMembers.reduce((sum, m) => sum + m.personalSalesVolume, 0);
    const totalMachineInflow = machineInflow > 0 ? machineInflow : Math.max(totalRevenue, memberVolume);
    const effectiveGrossRevenue = Math.max(totalRevenue, totalMachineInflow);

    const employeeEarningsFromTx = commissions
      .filter((c) => c.beneficiaryRole === 'EMPLOYEE' && c.status !== 'REVOKED')
      .reduce((sum, c) => sum + c.amount, 0);
    const employeeMemberTotal = hellobeeMembers
      .filter((m) => m.role === 'EMPLOYEE')
      .reduce((sum, m) => sum + m.totalCommissionEarned, 0);
    const totalEmployeeFunds = Math.max(employeeEarningsFromTx, employeeMemberTotal);

    const ownerCommissionFromTx = commissions
      .filter((c) => c.beneficiaryRole === 'OWNER' && c.status !== 'REVOKED')
      .reduce((sum, c) => sum + c.amount, 0);
    const ownerMemberTotal = hellobeeMembers
      .filter((m) => m.role === 'OWNER')
      .reduce((sum, m) => sum + m.totalCommissionEarned, 0);
    const totalOwnerCommissions = Math.max(ownerCommissionFromTx, ownerMemberTotal);

    const netCompanyRetained = Math.max(0, effectiveGrossRevenue - totalEmployeeFunds - totalOwnerCommissions);
    const totalOwnerProceeds = totalOwnerCommissions + netCompanyRetained;

    return {
      totalMachineInflow,
      machineUnitsSold:
        machineUnitsSold ||
        hellobeeMembers.reduce((sum, m) => sum + m.validOrdersCount, 0),
      effectiveGrossRevenue,
      totalEmployeeFunds,
      totalOwnerCommissions,
      netCompanyRetained,
      totalOwnerProceeds,
    };
  }, [orders, hellobeeMembers, commissions, totalRevenue]);

  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  // Low stock products
  const lowStockItems = useMemo(() => {
    const list: { product: any; sizeLabel: string; stock: number }[] = [];
    products.forEach((p) => {
      p.sizes.forEach((s) => {
        if (s.stock <= settings.lowStockThreshold) {
          list.push({ product: p, sizeLabel: s.label, stock: s.stock });
        }
      });
    });
    return list.slice(0, 5);
  }, [products, settings.lowStockThreshold]);

  // Revenue chart data (grouped by date)
  const revenueChartData = useMemo(() => {
    const map = new Map<string, number>();
    // Sort orders ascending
    const sorted = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((o) => {
      if (o.status !== 'Cancelled') {
        const dateKey = new Date(o.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        map.set(dateKey, (map.get(dateKey) || 0) + o.total);
      }
    });

    return Array.from(map.entries()).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    }));
  }, [orders]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const STATUS_COLORS: Record<string, string> = {
    Delivered: '#477A5A',
    Shipped: '#2B4C7E',
    Processing: '#B9A58B',
    Confirmed: '#111111',
    Pending: '#888888',
    Cancelled: '#B74747',
  };

  // Top selling products
  const topSellingProducts = useMemo(() => {
    const units = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      o.items.forEach((i) => units.set(i.productId, (units.get(i.productId) || 0) + i.quantity));
    });
    return products
      .map((product) => ({ product, sold: units.get(product.id) || 0 }))
      .filter((x) => x.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders, products]);

  // Recent 6 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 6);
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[#666666] mt-1">
          Real-time metrics calculated dynamically from active store data and browser local storage.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-[#E5E5E5] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Total Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-semibold text-[#111111]">
              {formatPrice(financialBreakdown.effectiveGrossRevenue)}
            </p>
            <span className="text-xs text-[#777777]">Gross store &amp; network revenue</span>
          </div>
          <div className="w-10 h-10 bg-[#F5F4F0] flex items-center justify-center text-[#111111]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-[#E5E5E5] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Total Orders
            </span>
            <p className="text-2xl sm:text-3xl font-semibold text-[#111111]">{totalOrdersCount}</p>
            <span className="text-xs text-[#777777]">
              {orders.filter((o) => o.status === 'Delivered').length} delivered successfully
            </span>
          </div>
          <div className="w-10 h-10 bg-[#F5F4F0] flex items-center justify-center text-[#111111]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-[#E5E5E5] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Active Products
            </span>
            <p className="text-2xl sm:text-3xl font-semibold text-[#111111]">{totalProductsCount}</p>
            <span className="text-xs text-[#777777]">
              Across {categories.length} categories
            </span>
          </div>
          <div className="w-10 h-10 bg-[#F5F4F0] flex items-center justify-center text-[#111111]">
            <Shirt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-[#E5E5E5] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#666666]">
              Registered Customers
            </span>
            <p className="text-2xl sm:text-3xl font-semibold text-[#111111]">{totalCustomersCount}</p>
            <span className="text-xs text-[#477A5A]">
              {customers.filter((c) => c.status === 'active').length} active patrons
            </span>
          </div>
          <div className="w-10 h-10 bg-[#F5F4F0] flex items-center justify-center text-[#111111]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Admin Financial & Revenue Distribution Breakdown */}
      <div className="bg-white border border-[#E5E5E5] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#B9A58B]">
              Financial Treasury &amp; Commission Allocation
            </span>
            <h2 className="text-base font-semibold text-[#111111] mt-0.5">
              Total Funds &amp; Revenue Distribution Breakdown
            </h2>
            <p className="text-xs text-[#777777]">
              Clear breakdown of machine sales inflow, gross revenue, employee commissions, and owner funds.
            </p>
          </div>
          <Link
            href="/admin/hellobee"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3.5 py-2 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors w-fit"
          >
            <span>Inspect Employees &amp; Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Machine Sales Inflow</span>
              <Cpu className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-bold text-[#111111] font-mono">
              {formatPrice(financialBreakdown.totalMachineInflow)}
            </p>
            <p className="text-[11px] text-[#666666]">
              Total device &amp; equipment inflow ({financialBreakdown.machineUnitsSold} unit{financialBreakdown.machineUnitsSold === 1 ? '' : 's'} sold)
            </p>
          </div>

          <div className="p-4 bg-[#FAF9F5] border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Total Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-bold text-[#111111] font-mono">
              {formatPrice(financialBreakdown.effectiveGrossRevenue)}
            </p>
            <p className="text-[11px] text-[#666666]">
              100% total sales revenue collected from orders
            </p>
          </div>

          <div className="p-4 bg-[#EBF3EA]/60 border border-[#2D5A27]/30 space-y-1.5">
            <div className="flex items-center justify-between text-[#2D5A27]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Employee Earnings</span>
              <UserCheck className="w-4 h-4 text-[#2D5A27]" />
            </div>
            <p className="text-2xl font-bold text-[#2D5A27] font-mono">
              {formatPrice(financialBreakdown.totalEmployeeFunds)}
            </p>
            <p className="text-[11px] text-[#2D5A27]/90">
              10% direct sales + 1% upline team overrides ({hellobeeMembers.filter((m) => m.role === 'EMPLOYEE').length} staff)
            </p>
          </div>

          <div className="p-4 bg-[#111111] text-white border border-[#111111] space-y-1.5">
            <div className="flex items-center justify-between text-[#B9A58B]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Owner Revenue &amp; Share</span>
              <Building2 className="w-4 h-4 text-[#B9A58B]" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {formatPrice(financialBreakdown.totalOwnerProceeds)}
            </p>
            <p className="text-[11px] text-[#CCCCCC]">
              Owner commissions ({formatPrice(financialBreakdown.totalOwnerCommissions)}) + Net retained ({formatPrice(financialBreakdown.netCompanyRetained)})
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                Revenue Trend ($)
              </h2>
              <p className="text-[11px] text-[#777777]">Computed from non-cancelled orders</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#111111]">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <div className="h-64 w-full">
            {revenueChartData.length === 0 ? (
              <EmptyNote>No orders yet. Revenue appears here after the first order.</EmptyNote>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111111"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders by Status (1 col) */}
        <div className="bg-white p-6 border border-[#E5E5E5]">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] mb-1">
            Order Status Breakdown
          </h2>
          <p className="text-[11px] text-[#777777] mb-4">Current fulfillment distribution</p>
          <div className="h-52 w-full">
            {orderStatusData.length === 0 ? (
              <EmptyNote>No orders yet.</EmptyNote>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || '#111111'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.name] || '#111111' }}
                />
                <span className="text-[#555555]">
                  {item.name}: <strong className="text-[#111111]">{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#E5E5E5]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
            >
              View all orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#777777] uppercase text-[10px]">
                  <th className="py-2.5 font-semibold">Order</th>
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#888888]">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F9F9F8]">
                    <td className="py-3 font-mono font-medium text-[#111111]">{o.id}</td>
                    <td className="py-3 font-medium text-[#111111]">{o.customerName}</td>
                    <td className="py-3">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 ${
                          o.status === 'Delivered'
                            ? 'bg-[#EAF3ED] text-[#477A5A]'
                            : o.status === 'Cancelled'
                            ? 'bg-[#FBEAEA] text-[#B74747]'
                            : 'bg-[#F5F4F0] text-[#111111]'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#777777]">{formatDate(o.createdAt)}</td>
                    <td className="py-3 text-right font-medium text-[#111111]">
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Top Sellers (1 col) */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white p-6 border border-[#E5E5E5] space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#B74747]" /> Low Stock Alerts
              </h2>
              <Link href="/admin/inventory" className="text-xs underline text-[#777777]">
                Manage
              </Link>
            </div>

            {lowStockItems.length > 0 ? (
              <div className="divide-y divide-[#E5E5E5] text-xs">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#111111] line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-[#777777]">Size: {item.sizeLabel}</p>
                    </div>
                    <span className="text-xs font-bold text-[#B74747] bg-[#FBEAEA] px-2 py-0.5">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#477A5A]">All inventory thresholds are healthy.</p>
            )}
          </div>

          {/* Top selling products */}
          <div className="bg-white p-6 border border-[#E5E5E5] space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
              Top Performing Products
            </h2>
            <div className="divide-y divide-[#E5E5E5]">
              {topSellingProducts.length === 0 && (
                <p className="py-4 text-xs text-[#888888]">No sales yet.</p>
              )}
              {topSellingProducts.map(({ product: p, sold }) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 bg-[#F5F4F0] flex-shrink-0 overflow-hidden border border-[#E5E5E5]">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <p className="font-medium text-[#111111] line-clamp-1">{p.name}</p>
                  </div>
                  <span className="font-semibold text-[#111111]">{sold} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
