<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCategoryAndDueDateToTasksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
   public function up()
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->string('category')->nullable()->after('description');
        $table->date('due_date')->nullable()->after('category');
    });
}

public function down()
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->dropColumn(['category', 'due_date']);
    });
}

}
