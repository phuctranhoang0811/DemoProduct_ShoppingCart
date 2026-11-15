<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CommissionTransaction;
use App\Models\Discount;
use App\Models\HellobeeMember;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Loads the storefront demo data exported from the Next.js app.
 * Regenerate the JSON with `npx tsx scripts/export-seed-data.ts` from the repo root.
 * Safe to re-run: rows are matched on their natural key.
 */
class StoreSeeder extends Seeder
{
    use WithoutModelEvents;

    private const DEMO_ACCOUNTS = ['customer@example.com', 'employee@hellobee.com', 'owner@hellobee.com'];

    /** @var array<string, Product> keyed by the id used in the exported data */
    private array $products = [];

    /** @var array<string, HellobeeMember> keyed by the id used in the exported data */
    private array $members = [];

    public function run(): void
    {
        DB::transaction(fn () => Model::unguarded(function () {
            $this->seedCatalog();
            $this->seedCustomers();
            $this->seedDiscounts();
            $this->seedOrders();
            $this->seedInventory();
            $this->seedSettings();
            $this->seedHellobee();
            $this->seedDemoPasswords();
        }));
    }

    private function seedCatalog(): void
    {
        $categories = [];
        foreach ($this->load('categories') as $row) {
            $categories[$row['id']] = Category::updateOrCreate(['slug' => $row['slug']], [
                'public_id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'image' => $row['image'],
                'status' => $row['status'],
            ]);
        }

        foreach ($this->load('products') as $row) {
            $product = Product::updateOrCreate(['slug' => $row['slug']], [
                'category_id' => $categories[$row['categoryId']]->id,
                'public_id' => $row['id'],
                'name' => $row['name'],
                'sku' => $row['sku'],
                'description' => $row['description'],
                'materials' => $row['materials'] ?? null,
                'details' => $row['details'] ?? [],
                'specifications' => $row['specifications'] ?? null,
                'price' => $row['price'],
                'original_price' => $row['originalPrice'] ?? null,
                'status' => $row['status'],
                'featured' => $row['featured'],
                'best_seller' => $row['bestSeller'],
                'new_arrival' => $row['newArrival'] ?? false,
                'sale' => $row['sale'] ?? false,
                'created_at' => Carbon::parse($row['createdAt']),
            ]);

            $product->images()->delete();
            foreach ($row['images'] as $position => $url) {
                $product->images()->create(['url' => $url, 'alt' => $row['name'], 'position' => $position]);
            }

            foreach ($row['colors'] as $color) {
                $product->colors()->updateOrCreate(['code' => $color['id']], [
                    'name' => $color['name'],
                    'hex' => $color['hex'],
                    'image' => $color['image'] ?? null,
                ]);
            }

            foreach ($row['sizes'] as $size) {
                $product->sizes()->updateOrCreate(['code' => $size['id']], [
                    'label' => $size['label'],
                    'stock' => $size['stock'],
                ]);
            }

            $this->products[$row['id']] = $product;
        }

        foreach ($this->load('reviews') as $row) {
            Review::updateOrCreate([
                'product_id' => $this->products[$row['productId']]->id,
                'customer_email' => $row['customerEmail'],
            ], [
                'customer_name' => $row['customerName'],
                'rating' => $row['rating'],
                'comment' => $row['comment'],
                'status' => $row['status'],
                'created_at' => Carbon::parse($row['createdAt']),
            ]);
        }
    }

    private function seedCustomers(): void
    {
        foreach ($this->load('customers') as $row) {
            $user = User::firstOrNew(['email' => $row['email']]);
            if (! $user->exists) {
                // Demo accounts get an unguessable password; real credentials arrive with the auth phase.
                $user->password = Str::random(40);
                $user->created_at = Carbon::parse($row['createdAt']);
            }
            $user->fill([
                'name' => $row['name'],
                'phone' => $row['phone'],
                'role' => $row['role'] ?? 'customer',
                'status' => $row['status'],
                'avatar' => $row['avatar'] ?? null,
                'sponsor_code' => $row['referralCode'] ?? null,
            ])->save();

            $user->addresses()->delete();
            foreach ($row['addresses'] as $address) {
                $user->addresses()->create([
                    'full_name' => $address['fullName'],
                    'phone' => $address['phone'],
                    'street' => $address['street'],
                    'ward' => $address['ward'] ?? null,
                    'district' => $address['district'] ?? null,
                    'city' => $address['city'],
                    'postal_code' => $address['postalCode'] ?? null,
                    'country' => $address['country'] ?? null,
                    'delivery_notes' => $address['deliveryNotes'] ?? null,
                    'is_default' => $address['isDefault'] ?? false,
                ]);
            }
        }
    }

    private function seedDiscounts(): void
    {
        foreach ($this->load('discounts') as $row) {
            Discount::updateOrCreate(['code' => $row['code']], [
                'type' => $row['type'],
                'value' => $row['value'],
                'min_order_amount' => $row['minOrderAmount'],
                'max_discount' => $row['maxDiscount'] ?? null,
                'starts_at' => Carbon::parse($row['startDate']),
                'ends_at' => Carbon::parse($row['endDate']),
                'usage_limit' => $row['usageLimit'],
                'used_count' => $row['usedCount'],
                'is_active' => $row['isActive'],
            ]);
        }
    }

    private function seedOrders(): void
    {
        $userIds = User::pluck('id', 'email');

        foreach ($this->load('orders') as $row) {
            $placedAt = Carbon::parse($row['createdAt']);

            $order = Order::updateOrCreate(['number' => $row['id']], [
                'user_id' => $userIds[$row['customerEmail']] ?? null,
                'customer_name' => $row['customerName'],
                'customer_email' => $row['customerEmail'],
                'customer_phone' => $row['customerPhone'],
                'shipping_street' => $row['shippingAddress']['street'],
                'shipping_ward' => $row['shippingAddress']['ward'] ?? null,
                'shipping_district' => $row['shippingAddress']['district'] ?? null,
                'shipping_city' => $row['shippingAddress']['city'],
                'delivery_method' => $row['deliveryMethod'],
                'payment_method' => $row['paymentMethod'],
                'payment_status' => $row['paymentStatus'],
                'status' => $row['status'],
                'subtotal' => $row['subtotal'],
                'discount_amount' => $row['discountAmount'],
                'discount_code' => $row['discountCode'] ?? null,
                'shipping_fee' => $row['shippingFee'],
                'total' => $row['total'],
                'referral_code' => $row['referralCode'] ?? null,
                'notes' => $row['notes'] ?? null,
                'created_at' => $placedAt,
            ]);

            $order->items()->delete();
            foreach ($row['items'] as $item) {
                $order->items()->create([
                    // Some demo orders reference products that are no longer in the catalog.
                    'product_id' => ($this->products[$item['productId']] ?? null)?->id,
                    'product_name' => $item['productName'],
                    'slug' => $item['slug'],
                    'image' => $item['image'] ?? null,
                    'price' => $item['price'],
                    'color_name' => $item['colorName'] ?? null,
                    'size' => $item['size'] ?? null,
                    'quantity' => $item['quantity'],
                ]);
            }

            $order->statusHistory()->delete();
            $history = $row['statusHistory'] ?? [['status' => $row['status'], 'timestamp' => $row['createdAt']]];
            foreach ($history as $entry) {
                $order->statusHistory()->create([
                    'status' => $entry['status'],
                    'note' => $entry['note'] ?? null,
                    'created_at' => Carbon::parse($entry['timestamp']),
                ]);
            }
        }
    }

    private function seedInventory(): void
    {
        InventoryMovement::query()->delete();

        foreach ($this->load('inventory_movements') as $row) {
            InventoryMovement::create([
                'product_id' => ($this->products[$row['productId']] ?? null)?->id,
                'product_name' => $row['productName'],
                'variant_info' => $row['variantInfo'] ?? null,
                'change' => $row['change'],
                'previous_stock' => $row['previousStock'],
                'new_stock' => $row['newStock'],
                'reason' => $row['reason'],
                'moved_at' => Carbon::parse($row['date']),
            ]);
        }
    }

    private function seedSettings(): void
    {
        foreach ($this->load('settings') as $key => $value) {
            Setting::updateOrCreate(['key' => Str::snake($key)], ['value' => $value]);
        }
    }

    private function seedHellobee(): void
    {
        $rows = $this->load('hellobee_members');

        foreach ($rows as $row) {
            $this->members[$row['id']] = HellobeeMember::updateOrCreate(['email' => $row['email']], [
                'user_id' => $this->staffUser($row)->id,
                'public_id' => $row['id'],
                'name' => $row['name'],
                'role' => $row['role'],
                'phone' => $row['phone'] ?? null,
                'referral_code' => $row['referralCode'],
                'rank' => $row['rank'],
                'valid_orders_count' => $row['validOrdersCount'],
                'personal_sales_volume' => $row['personalSalesVolume'],
                'network_sales_volume' => $row['networkSalesVolume'],
                'direct_invite_count' => $row['directInviteCount'],
                'total_commission_earned' => $row['totalCommissionEarned'],
                'available_balance' => $row['availableBalance'],
                'has_purchased_filtration_device' => $row['hasPurchasedFiltrationDevice'],
                'is_active' => $row['isActive'],
                'avatar_url' => $row['avatarUrl'] ?? null,
                'created_at' => Carbon::parse($row['createdAt']),
            ]);
        }

        // Second pass: the tree links need every member to exist first.
        foreach ($rows as $row) {
            $this->members[$row['id']]->update([
                'referred_by_id' => ($this->members[$row['referredById'] ?? ''] ?? null)?->id,
                'owner_id' => ($this->members[$row['ownerId'] ?? ''] ?? null)?->id,
            ]);
        }

        $orderIds = Order::pluck('id', 'number');

        CommissionTransaction::query()->delete();
        foreach ($this->load('commission_transactions') as $row) {
            CommissionTransaction::create([
                'order_id' => $orderIds[$row['orderNumber']] ?? null,
                'order_number' => $row['orderNumber'],
                'order_amount' => $row['orderAmount'],
                'buyer_name' => $row['buyerName'],
                'beneficiary_id' => $this->members[$row['beneficiaryId']]->id,
                'commission_type' => $row['commissionType'],
                'rate' => $row['rate'],
                'amount' => $row['amount'],
                'status' => $row['status'],
                'notes' => $row['notes'] ?? null,
                'created_at' => Carbon::parse($row['createdAt']),
            ]);
        }

        PayoutRequest::query()->delete();
        foreach ($this->load('payout_requests') as $row) {
            PayoutRequest::create([
                'member_id' => $this->members[$row['memberId']]->id,
                'amount' => $row['amount'],
                'bank_name' => $row['bankName'],
                'bank_account_number' => $row['bankAccountNumber'],
                'bank_account_name' => $row['bankAccountName'],
                'status' => $row['status'],
                'requested_at' => Carbon::parse($row['requestedAt']),
                'processed_at' => isset($row['processedAt']) ? Carbon::parse($row['processedAt']) : null,
            ]);
        }
    }

    /**
     * Network members sign in too: owners administer the store, employees use the staff portal.
     *
     * @param  array<string, mixed>  $member
     */
    private function staffUser(array $member): User
    {
        $user = User::firstOrNew(['email' => $member['email']]);
        if (! $user->exists) {
            $user->password = Str::random(40);
            $user->created_at = Carbon::parse($member['createdAt']);
        }
        $user->fill([
            'name' => trim(preg_replace('/\s*\(.*\)/', '', $member['name'])),
            'phone' => $member['phone'] ?? null,
            'role' => $member['role'] === 'OWNER' ? 'admin' : 'employee',
            'status' => $member['isActive'] ? 'active' : 'inactive',
        ])->save();

        return $user;
    }

    /**
     * Gives the demo accounts a known password when SEED_DEMO_PASSWORD is set (never in production).
     */
    private function seedDemoPasswords(): void
    {
        $password = config('services.storefront.seed_demo_password');

        if (! $password || app()->isProduction()) {
            return;
        }

        User::whereIn('email', self::DEMO_ACCOUNTS)->get()
            // Re-hashing an unchanged password would needlessly rewrite the row on every run.
            ->reject(fn (User $user) => Hash::check($password, $user->password))
            ->each(fn (User $user) => $user->forceFill(['password' => $password])->save());
    }

    /** @return array<int|string, mixed> */
    private function load(string $name): array
    {
        $path = __DIR__."/data/{$name}.json";

        if (! is_file($path)) {
            throw new RuntimeException("Seed data missing: {$path}. Run `npx tsx scripts/export-seed-data.ts` from the repo root.");
        }

        return json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }
}
