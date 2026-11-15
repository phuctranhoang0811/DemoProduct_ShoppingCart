<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'country', 'tax_year', 'income_type', 'currency', 'gross_income', 'total_tax', 'net_income', 'effective_tax_rate', 'rule_version', 'status', 'input_snapshot', 'result_snapshot'])]
class TaxCalculation extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'input_snapshot' => 'encrypted:array',
            'result_snapshot' => 'encrypted:array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
