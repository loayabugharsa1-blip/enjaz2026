import { OrderForm } from "@/components/public/order-form";

export default function OrderPage() {
  return (
    <div className="py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-3">طلب خدمة أونلاين / Online Order</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          اختر الخدمة التي تريدها وسنقوم بالتواصل معك في أقرب وقت
        </p>
      </div>
      <OrderForm />
    </div>
  );
}
