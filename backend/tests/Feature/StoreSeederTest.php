<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CommissionTransaction;
use App\Models\HellobeeMember;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\StoreSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_loads_the_exported_storefront_data(): void
    {
        $this->seed(StoreSeeder::class);

        $this->assertSame(5, Category::count());
        $this->assertSame(14, Product::count());
        $this->assertSame(6, Review::count());
        $this->assertSame(17, User::count());
        $this->assertSame(2, User::where('role', 'admin')->count());
        $this->assertSame(3, User::where('role', 'employee')->count());
        $this->assertSame(20, Order::count());
        $this->assertSame(5, HellobeeMember::count());
        $this->assertSame(6, CommissionTransaction::count());
    }

    public function test_a_product_carries_its_options_and_typed_attributes(): void
    {
        $this->seed(StoreSeeder::class);

        $product = Product::where('slug', 'enagic-leveluk-k8')->with(['category', 'images', 'colors', 'sizes'])->sole();

        $this->assertSame('ionizers', $product->category->slug);
        $this->assertSame(8, $product->specifications['electrodes']);
        $this->assertIsArray($product->details);
        $this->assertNotEmpty($product->images);
        $this->assertNotEmpty($product->colors);
        $this->assertGreaterThan(0, $product->sizes->sum('stock'));
    }

    public function test_orders_keep_line_items_whose_product_left_the_catalog(): void
    {
        $this->seed(StoreSeeder::class);

        $order = Order::where('number', 'ORD-9021')->with(['items', 'user', 'statusHistory'])->sole();

        $this->assertSame('customer@example.com', $order->user->email);
        $this->assertSame('275.00', $order->total);
        $this->assertCount(2, $order->items);
        $this->assertNull($order->items->first()->product_id);
        $this->assertSame('Oversized Poplin Shirt', $order->items->first()->product_name);
        $this->assertCount(1, $order->statusHistory);
    }

    public function test_hellobee_members_are_linked_into_a_tree(): void
    {
        $this->seed(StoreSeeder::class);

        $employee = HellobeeMember::where('referral_code', 'HB-EMP-101')->with('owner')->sole();

        $this->assertSame('OWNER', $employee->owner->role);
        $this->assertSame(0, HellobeeMember::where('role', 'EMPLOYEE')->whereNull('owner_id')->count());
    }

    public function test_seeding_twice_does_not_duplicate_rows(): void
    {
        $this->seed(StoreSeeder::class);
        $passwordHash = User::where('email', 'customer@example.com')->value('password');
        $orderItems = OrderItem::count();

        $this->seed(StoreSeeder::class);

        $this->assertSame(14, Product::count());
        $this->assertSame(20, Order::count());
        $this->assertSame($orderItems, OrderItem::count());
        $this->assertSame($passwordHash, User::where('email', 'customer@example.com')->value('password'));
        $this->assertSame('USD', Setting::find('currency')->value);
    }
}
