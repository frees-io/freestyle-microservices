/*
 * Copyright 2017 47 Degrees, LLC. <http://www.47deg.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package freestyle
package opscenter
package model

import akka.http.scaladsl.model.ws.BinaryMessage
import akka.util.ByteString

case class Metric[T](metric: String, microservice: String, value: T, date: Long) {
  override def toString(): String      = s"$microservice $date $metric $value"
  def toBinaryMessage(): BinaryMessage = BinaryMessage(ByteString(this.toString()))
}
