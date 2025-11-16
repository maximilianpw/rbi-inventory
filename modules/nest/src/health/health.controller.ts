import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health-check')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the API',
    operationId: 'healthCheck',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
